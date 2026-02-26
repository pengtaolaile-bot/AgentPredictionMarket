// ethers v5 版本
import { ethers } from 'ethers';
import axios from 'axios';

/**
 * 获取API基础URL，使用当前页面的IP地址
 * @returns {string} API基础URL
 */
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  return `https://matilde-insipient-expressionlessly.ngrok-free.dev`;
};

// 合约地址配置
const CONTRACT_ADDRESSES = {
  predictionMarket: '0*********************************0' // Monad测试网合约地址
};

// 预测市场合约 ABI
const PREDICTION_MARKET_ABI = [
  "function agentCount() external view returns (uint256)",
  "function predictionCount() external view returns (uint256)",
  "function getAgent(uint256 _agentId) external view returns (uint256 id, string memory name, string memory title, string memory domain, uint256 totalPredictions, uint256 correctPredictions, uint256 hitRate, bool[] memory recentPerformance, uint256[] memory predictIds)",
  "function getPrediction(uint256 _predictId) external view returns (uint256 id, uint256 eventId, uint256 agentId, string predictResult, uint256 predictProbability, string memory ipfsHash, bool isCorrect)",
  "function getAgentsByDomain(string memory) external view returns (uint256[] memory)",
  "function getAllAgentIds() public view returns (uint256[] memory)",
  "function getEventPredictions(uint256 _eventId) external view returns (uint256[] memory)",
  "function getAgentPredictions(uint256 _agentId) external view returns (uint256[] memory)",
  "function payFee() external payable",
  "event FeePaid(address indexed payer, uint256 amount)"
];

/**
 * Ethereum 服务类
 * 提供以太坊区块链交互的常用方法
 */
class EthereumService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
  }

  /**
   * 初始化以太坊服务
   * @returns {Promise<void>}
   */
  async init() {
    if (!window.ethereum) {
      throw new Error('请先安装 MetaMask 或其他以太坊钱包');
    }
    
    // v5 写法：使用 Web3Provider
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // 请求账户访问权限
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // 获取 signer (v5不需要await)
    this.signer = this.provider.getSigner();
    
    // 初始化合约实例
    this.contracts = await this.initContracts();
  }

  /**
   * 初始化合约实例
   * @returns {Promise<Object>}
   */
  async initContracts() {
    if (!this.signer) {
      throw new Error('Signer 未初始化。请先调用 init()');
    }
    return {
      predictionMarket: new ethers.Contract(
        CONTRACT_ADDRESSES.predictionMarket,
        PREDICTION_MARKET_ABI,
        this.signer
      )
    };
  }

  /**
   * 获取单个事件信息
   * @param {number} eventId - 事件ID
   * @returns {Promise<Object>}
   */
  async getEvent(eventId) {
    try {
      // 调用本地服务获取事件信息
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/api/events?id=${eventId}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      return response.data;
    } catch (error) {
      console.error('本地服务调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取单个AI数字人信息
   * @param {number} agentId - AI数字人ID
   * @returns {Promise<Object>}
   */
  async getAgent(agentId) {
    if (!this.contracts.predictionMarket) {
      await this.init();
    }
    try {
      // v5 调用合约函数
      const agent = await this.contracts.predictionMarket.getAgent(agentId);
      // 解析返回的数据 (v5返回数组)
      return {
        id: agent.id.toString(),
        name: agent.name,
        title: agent.title,
        domain: agent.domain,
        totalPredictions: agent.totalPredictions.toString(),
        correctPredictions: agent.correctPredictions.toString(),
        hitRate: agent.hitRate.toString(),
        recentPerformance: agent.recentPerformance,
        predictIds: agent.predictIds.map(id => parseInt(id.toString()))
      };
    } catch (error) {
      console.error('合约调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 从IPFS获取预测详细数据
   * @param {string} ipfsHash - IPFS哈希
   * @returns {Promise<Object>}
   */
  async getPredictionDetailsFromIPFS(ipfsHash) {
    try {
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const response = await axios.get(url);
      return {
        reason: response.data.reason || '',
        coreConclusion: response.data.core_conclusion || ''
      };
    } catch (error) {
      console.error('从IPFS获取数据失败:', error.message);
      // 如果IPFS请求失败，返回空值
      return {
        reason: '',
        coreConclusion: ''
      };
    }
  }

  /**
   * 获取单个预测信息
   * @param {number} predictId - 预测ID
   * @returns {Promise<Object>}
   */
  async getPrediction(predictId) {
    if (!this.contracts.predictionMarket) {
      await this.init();
    }

    try {
      const prediction = await this.contracts.predictionMarket.getPrediction(predictId);
      
      // 从IPFS获取详细数据
      const details = await this.getPredictionDetailsFromIPFS(prediction.ipfsHash);
      
      // 解析返回的数据 (v5返回数组)
      return {
        id: prediction.id.toString(),
        eventId: prediction.eventId.toString(),
        agentId: prediction.agentId.toString(),
        predictResult: prediction.predictResult,
        predictProbability: prediction.predictProbability.toString(),
        ipfsHash: prediction.ipfsHash,
        reason: details.reason,
        coreConclusion: details.coreConclusion,
        isCorrect: prediction.isCorrect
      };
    } catch (error) {
      console.error('合约调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取事件列表
   * @param {string} domain - 事件领域（可选）
   * @param {number} status - 事件状态（可选）
   * @returns {Promise<Array<Object>>}
   */
  async getEvents(domain, status) {
    try {
      // 构建查询参数
      const params = {};
      if (domain) params.domain = domain;
      if (status !== undefined) params.status = status;
      
      // 调用本地服务获取事件列表
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/api/events`, {
        params,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      return response.data;
    } catch (error) {
      console.error('本地服务调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取所有AI数字人列表
   * @param {string} domain - 领域参数（合约会忽略此参数，直接返回所有AI数字人）
   * @returns {Promise<Array<Object>>}
   */
  async getAgentsByDomain() {
    if (!this.contracts.predictionMarket) {
      await this.init();
    }
    try {
      const agentIds = await this.contracts.predictionMarket.getAgentsByDomain('all');
      const agentIdsArray = agentIds.map(id => parseInt(id.toString()));
      
      // 获取每个AI数字人的详细信息
      const agents = await Promise.all(
        agentIdsArray.map(id => this.getAgent(id))
      );
      return agents;
    } catch (error) {
      console.error('合约调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取事件的预测列表
   * @param {number} eventId - 事件ID
   * @returns {Promise<Array<Object>>}
   */
  async getEventPredictions(eventId) {
    if (!this.contracts.predictionMarket) {
      await this.init();
    }

    try {
      const predictIds = await this.contracts.predictionMarket.getEventPredictions(eventId);
      const predictIdsArray = predictIds.map(id => parseInt(id.toString()));
      // 获取每个预测的详细信息
      const predictions = await Promise.all(
        predictIdsArray.map(id => this.getPrediction(id))
      );
      return predictions;
    } catch (error) {
      console.error('合约调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取AI数字人的预测列表
   * @param {number} agentId - AI数字人ID
   * @returns {Promise<Array<Object>>}
   */
  async getAgentPredictions(agentId) {
    if (!this.contracts.predictionMarket) {
      await this.init();
    }

    try {
      const predictIds = await this.contracts.predictionMarket.getAgentPredictions(agentId);
      const predictIdsArray = predictIds.map(id => parseInt(id.toString()));
      
      // 获取每个预测的详细信息
      const predictions = await Promise.all(
        predictIdsArray.map(id => this.getPrediction(id))
      );
      
      return predictions;
    } catch (error) {
      console.error('合约调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 直接获取所有AI数字人ID列表
   * @returns {Promise<Array<number>>}
   */
  async getAllAgentIds() {
    if (!this.contracts.predictionMarket) {
      await this.init();
    }
    try {
      const agentIds = await this.contracts.predictionMarket.getAllAgentIds();
      return agentIds.map(id => parseInt(id.toString()));
    } catch (error) {
      console.error('合约调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取账户地址
   * @returns {Promise<string>}
   */
  async getAccount() {
    if (!this.signer) {
      await this.init();
    }
    return await this.signer.getAddress();
  }

  /**
   * 切换网络
   * @param {number} chainId - 链ID
   * @returns {Promise<void>}
   */
  async switchNetwork(chainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
    } catch (error) {
      console.error('切换网络失败:', error);
      throw error;
    }
  }

  /**
   * 监听账户变化
   * @param {Function} callback - 回调函数
   */
  onAccountsChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        callback(accounts);
      });
    }
  }

  /**
   * 监听网络变化
   * @param {Function} callback - 回调函数
   */
  onChainChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        callback(chainId);
      });
    }
  }

  /**
   * 支付费用
   * @returns {Promise<Object>} 交易结果
   */
  async payFee() {
    if (!this.contracts.predictionMarket) {
      await this.init();
    }

    try {
      // 调用合约的payFee函数，发送0.1MON
      const tx = await this.contracts.predictionMarket.payFee({
        value: ethers.utils.parseEther('0.1') // 0.1MON
      });
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('支付费用失败:', error);
      console.error('错误详情:', JSON.stringify(error));
      
      // 解析错误信息，提取更友好的错误提示
      let errorMessage = '支付失败，请重试';
      
      // 处理不同类型的错误
      if (error.code === -32603) {
        // JSON-RPC 错误
        if (error.data && error.data.message) {
          if (error.data.message.includes('insufficient balance')) {
            errorMessage = '余额不足，请确保您的钱包中有足够的资金';
          } else if (error.data.message.includes('rejected')) {
            errorMessage = '您拒绝了支付请求';
          } else {
            errorMessage = error.data.message;
          }
        } else {
          errorMessage = '钱包操作失败，请检查您的钱包状态';
        }
      } else if (error.message) {
        if (error.message.includes('insufficient balance')) {
          errorMessage = '余额不足，请确保您的钱包中有足够的资金';
        } else if (error.message.includes('rejected')) {
          errorMessage = '您拒绝了支付请求';
        } else if (error.message.includes('Fee must be exactly 0.1 MON')) {
          errorMessage = '支付金额必须为0.1MON';
        } else if (error.message.includes('Internal JSON-RPC error')) {
          errorMessage = '钱包操作失败，请检查您的钱包状态';
        } else {
          errorMessage = error.message;
        }
      } else if (error.error) {
        errorMessage = error.error;
      }
            
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

// 导出单例实例
const ethereumService = new EthereumService();

export {
  ethereumService,
  EthereumService
};