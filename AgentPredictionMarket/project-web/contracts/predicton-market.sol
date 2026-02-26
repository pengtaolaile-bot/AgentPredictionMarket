// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title 预测市场智能合约（数组版recentPerformance）
 * @dev 核心设计：
 * 1. recentPerformance直接使用bool数组，仅在endEvent时添加结果
 * 2. 数组自动保留最新20条记录，超出则删除最旧的
 * 3. 未调用endEvent时，数组为空，无任何false/true值
 */
contract PredictionMarket is Ownable, ReentrancyGuard {

    /**
     * @dev AI数字人数据结构
     * recentPerformance改为bool数组，初始为空
     */
    struct Agent {
        uint256 id;                 // 32字节
        uint256 totalPredictions;   // 32字节（仅统计预测数量）
        uint256 correctPredictions; // 32字节（仅endEvent更新）
        bool[] recentPerformance;   // 核心：直接存储最近20次评估结果（bool数组）
        string name;                // 动态
        string title;               // 动态
        string domain;              // 动态
        uint256[] predictIds;       // 动态（仅存储预测ID）
    }

    /**
     * @dev 预测数据结构
     */
    struct Prediction {
        uint256 id;                 // 32字节
        uint256 eventId;            // 32字节
        uint256 agentId;            // 32字节
        uint256 predictProbability; // 32字节
        bool isCorrect;             // 1字节（仅endEvent赋值）
        bool isEvaluated;           // 1字节（仅endEvent标记）
        string predictResult;       // 动态 - 存储预测结果
        string ipfsHash;            // 动态 - IPFS哈希
    }

    // ========== 状态变量 ==========
    mapping(uint256 => Agent) internal _agents;
    uint256 public agentCount;

    mapping(uint256 => Prediction) internal _predictions;
    uint256 public predictionCount;

    mapping(bytes32 => uint256[]) internal _agentsByDomain;
    mapping(uint256 => uint256[]) internal _predictionsByEvent;
    mapping(uint256 => bool) internal _eventIsEnded; // 标记事件是否已结束

    uint256[] public allAgentIds;

    // ========== 事件定义 ==========
    event AgentAdded(uint256 indexed agentId, string name, string domain);
    event PredictionAdded(uint256 indexed predictionId, uint256 indexed eventId, uint256 indexed agentId, string predictResult);
    event FeePaid(address indexed payer, uint256 amount);
    event PredictionEvaluated(uint256 indexed predictId, bool isCorrect);
    event EventEnded(uint256 indexed eventId, string result);

    // ========== 常量 ==========
    uint256 private constant MAX_RECENT_PERFORMANCE = 20; // 最多保留20条最新记录

    // ========== 工具函数 ==========
    function _stringToBytes32(string memory str) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(str));
    }

    // ========== 验证函数 ==========
    function _validateAgentExists(uint256 agentId) internal view {
        require(_agents[agentId].id == agentId, "Agent does not exist");
    }

    function _validateProbability(uint256 probability) internal pure {
        require(probability <= 100, "Probability must be 0-100");
    }

    function _validateNonEmptyString(string memory str, string memory message) internal pure {
        require(bytes(str).length > 0, message);
    }

    function _validateEventNotEnded(uint256 eventId) internal view {
        require(!_eventIsEnded[eventId], "Event has already been ended");
    }

    // ========== 核心业务函数 ==========
    function addAgent(
        uint256 _id,
        string memory _name,
        string memory _title,
        string memory _domain
    ) external onlyOwner nonReentrant {
        _validateNonEmptyString(_name, "Agent name cannot be empty");
        _validateNonEmptyString(_domain, "Agent domain cannot be empty");
        require(_agents[_id].id == 0, "Agent ID already exists");

        // 初始化时recentPerformance为空数组，无任何记录
        _agents[_id] = Agent({
            id: _id,
            name: _name,
            title: _title,
            domain: _domain,
            totalPredictions: 0,
            correctPredictions: 0,
            recentPerformance: new bool[](0), // 初始为空数组
            predictIds: new uint256[](0)
        });

        _agentsByDomain[_stringToBytes32(_domain)].push(_id);
        allAgentIds.push(_id);
        agentCount++;

        emit AgentAdded(_id, _name, _domain);
    }

    function addPrediction(
        uint256 _eventId,
        uint256 _agentId,
        string memory _predictResult,
        uint256 _predictProbability,
        string memory _ipfsHash
    ) external onlyOwner nonReentrant {
        _validateAgentExists(_agentId);
        _validateNonEmptyString(_predictResult, "Predict result cannot be empty");
        _validateNonEmptyString(_ipfsHash, "IPFS hash cannot be empty");
        _validateProbability(_predictProbability);
        _validateEventNotEnded(_eventId); // 禁止向已结束事件加预测

        uint256 newPredictionId = predictionCount;
        
        _predictions[newPredictionId] = Prediction({
            id: newPredictionId,
            eventId: _eventId,
            agentId: _agentId,
            predictResult: _predictResult,
            predictProbability: _predictProbability,
            isCorrect: false, // 未评估时无意义
            isEvaluated: false, // 初始未评估
            ipfsHash: _ipfsHash
        });

        _predictionsByEvent[_eventId].push(newPredictionId);
        
        Agent storage agent = _agents[_agentId];
        agent.totalPredictions++; // 仅统计数量，不触碰recentPerformance
        agent.predictIds.push(newPredictionId);

        predictionCount++;

        emit PredictionAdded(newPredictionId, _eventId, _agentId, _predictResult);
    }

    // ========== 读取函数（直接返回数组，无解析漏洞） ==========
    function getAgent(uint256 _agentId) external view returns (
        uint256 id,
        string memory name,
        string memory title,
        string memory domain,
        uint256 totalPredictions,
        uint256 correctPredictions,
        uint256 hitRate,
        bool[] memory recentPerformance,
        uint256[] memory predictIds
    ) {
        Agent storage agentData = _agents[_agentId];
        require(agentData.id == _agentId, "Agent does not exist");
        
        // 计算命中率
        hitRate = agentData.totalPredictions > 0 
            ? (agentData.correctPredictions * 100) / agentData.totalPredictions 
            : 0;

        // 直接返回原数组（未调用endEvent时为空，无任何值）
        recentPerformance = agentData.recentPerformance;

        return (
            agentData.id,
            agentData.name,
            agentData.title,
            agentData.domain,
            agentData.totalPredictions,
            agentData.correctPredictions,
            hitRate,
            recentPerformance,
            agentData.predictIds
        );
    }

    function getPrediction(uint256 _predictId) external view returns (
        uint256 id,
        uint256 eventId,
        uint256 agentId,
        string memory predictResult,
        uint256 predictProbability,
        string memory ipfsHash,
        bool isCorrect,
        bool isEvaluated
    ) {
        Prediction storage predictionData = _predictions[_predictId];
        require(predictionData.id == _predictId, "Prediction does not exist");
        
        return (
            predictionData.id,
            predictionData.eventId,
            predictionData.agentId,
            predictionData.predictResult,
            predictionData.predictProbability,
            predictionData.ipfsHash,
            predictionData.isCorrect,
            predictionData.isEvaluated
        );
    }

    function getAgentsByDomain(string memory) external view returns (uint256[] memory) {
        return allAgentIds;
    }

    function getEventPredictions(uint256 _eventId) external view returns (uint256[] memory) {
        return _predictionsByEvent[_eventId];
    }

    function getAgentPredictions(uint256 _agentId) external view returns (uint256[] memory) {
        _validateAgentExists(_agentId);
        return _agents[_agentId].predictIds;
    }

    function getAllAgentIds() public view returns (uint256[] memory) {
        return allAgentIds;
    }

    function isEventEnded(uint256 eventId) external view returns (bool) {
        return _eventIsEnded[eventId];
    }

    /**
     * @dev 结束事件并评估预测（唯一能修改recentPerformance的函数）
     * 核心逻辑：向数组添加结果，超出20条则删除最旧的（保持最新20条）
     */
    function endEvent(uint256 _eventId, string memory _result) external onlyOwner nonReentrant {
        _validateNonEmptyString(_result, "Result cannot be empty");
        _validateEventNotEnded(_eventId);
        require(_predictionsByEvent[_eventId].length > 0, "No predictions for this event");

        // 标记事件已结束
        _eventIsEnded[_eventId] = true;
        bytes32 resultHash = _stringToBytes32(_result);

        // 对该事件下所有预测做一次评估
        for (uint256 i = 0; i < _predictionsByEvent[_eventId].length; i++) {
            uint256 predictId = _predictionsByEvent[_eventId][i];
            Prediction storage prediction = _predictions[predictId];
            
            // 1. 判定预测结果
            prediction.isCorrect = (_stringToBytes32(prediction.predictResult) == resultHash);
            prediction.isEvaluated = true;

            // 2. 更新正确预测数
            Agent storage agent = _agents[prediction.agentId];
            if (prediction.isCorrect) {
                agent.correctPredictions++;
            }

            // 3. 核心：向recentPerformance数组添加结果（仅此处操作）
            // 步骤1：添加最新结果到数组末尾
            agent.recentPerformance.push(prediction.isCorrect);
            
            // 步骤2：如果超过20条，删除最旧的（数组第一个元素）
            if (agent.recentPerformance.length > MAX_RECENT_PERFORMANCE) {
                // Solidity数组删除首个元素：将后续元素前移，再缩短长度
                for (uint256 j = 0; j < agent.recentPerformance.length - 1; j++) {
                    agent.recentPerformance[j] = agent.recentPerformance[j + 1];
                }
                agent.recentPerformance.pop();
            }

            emit PredictionEvaluated(predictId, prediction.isCorrect);
        }

        emit EventEnded(_eventId, _result);
    }

    /**
     * @dev 支付费用函数
     */
    function payFee() external payable nonReentrant {
        require(msg.value == 100000000000000000, "Fee must be exactly 0.1 MON");
        payable(owner()).transfer(msg.value);
        emit FeePaid(msg.sender, msg.value);
    }
}