// 主应用组件
function App() {
  // 页面状态
  const [currentPage, setCurrentPage] = React.useState('home');
  
  // AI对话状态
  const [messages, setMessages] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  
  // AI绘画状态
  const [drawPrompt, setDrawPrompt] = React.useState('');
  const [drawImage, setDrawImage] = React.useState('');
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [drawError, setDrawError] = React.useState('');
  

  
  // 关于我们状态
  const [aboutContent, setAboutContent] = React.useState('"辰光未来星"网站源于2026.02.01，是张晟睿根据既有项目"东辰未来星"制作的衍生产品。起初是为汉中东辰外国语学校提供相关智慧教育解决方案和想法设立的，后因观念更新等问题转向社会智慧教育解决方案研发。当前项目已经推出微信小程序版本（目前停留在教育版，不能在微信APP内搜索）和网站版本。网站已经永久托管在GitHub上，每月拥有100GB带宽，预计可接受一万人的月访问量。2026年6月，作者将开始HarmonyOS、Android、IOS的多端研发，预计2026年底全部出品，敬请期待！');
  const [isLoadingAbout, setIsLoadingAbout] = React.useState(false);
  const [aboutError, setAboutError] = React.useState('');
  
  // AI批改状态
  const [correctionState, setCorrectionState] = React.useState({
    // 上传状态
    image: '',
    isUploading: false,
    uploadError: '',
    
    // 批改状态
    isCorrecting: false,
    correctionResults: [],
    correctionError: ''
  });
  
  // 学习计划状态
  const [studyPlanState, setStudyPlanState] = React.useState({
    input: '',
    isGenerating: false,
    result: '',
    error: ''
  });
  
  // 消息容器引用，用于滚动到最新消息
  const messagesEndRef = React.useRef(null);

  // 当消息列表变化时，滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  // 组件挂载时设置about content
  React.useEffect(() => {
    // 直接使用硬编码的内容，不再从外部文件读取
    console.log('使用硬编码的about content');
  }, []);

  // 智谱AI API配置
  const API_KEY = '4622524be02c461ca169160d9f01669d.YlDaSBLuxodfrtvQ';
  const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  
  // 智谱AI绘画API配置
  const DRAW_API_KEY = '4e3c3ce38ddd41d29c13e09870cd6da8.Z85j4GcZyTseJwRl';
  const DRAW_API_URL = 'https://open.bigmodel.cn/api/paas/v4/images/generations';

  // 发送消息处理函数
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // 添加用户消息
    const userMessage = new Message(
      Date.now().toString(),
      'user',
      inputValue.trim()
    );
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 构建API请求参数
      const requestData = {
        model: 'glm-4.7-flash',
        messages: [
          {
            role: 'user',
            content: userMessage.content
          }
        ],
        thinking: {
          type: 'enabled'
        },
        max_tokens: 65536,
        temperature: 1.0
      };

      // 直接调用智谱AI API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
      }

      // 解析响应数据
      const data = await response.json();
      
      // 提取AI的回答
      const aiContent = data.choices?.[0]?.message?.content || 'AI暂时无法回答，请稍后重试';
      
      // 添加AI消息
      const aiMessage = new Message(
        (Date.now() + 1).toString(),
        'ai',
        aiContent
      );
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 添加错误消息
      const errorMessage = new Message(
        (Date.now() + 1).toString(),
        'ai',
        `抱歉，AI服务暂时不可用。错误信息：${error.message || '未知错误'}`
      );
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // 处理回车键发送消息
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理导航点击
  const handleNavClick = (page) => {
    setCurrentPage(page);
    // 重置对应页面的状态
    if (page === 'chat') {
      resetChatState();
    } else if (page === 'draw') {
      resetDrawState();
    } else if (page === 'correction') {
      resetCorrectionState();
    } else if (page === 'study-plan') {
      resetStudyPlanState();
    }
  };

  // 重置AI对话状态
  const resetChatState = () => {
    setMessages([]);
    setInputValue('');
    setIsLoading(false);
  };

  // 重置AI绘画状态
  const resetDrawState = () => {
    setDrawPrompt('');
    setDrawImage('');
    setIsDrawing(false);
    setDrawError('');
  };
  
  // AI绘画API调用函数
  const handleDrawImage = async () => {
    if (!drawPrompt.trim() || isDrawing) return;

    // 重置错误信息
    setDrawError('');
    setIsDrawing(true);
    setDrawImage('');

    try {
      // 构建API请求参数
      const requestData = {
        model: 'cogview-3-flash',
        prompt: drawPrompt.trim(),
        size: '1280x1280'
      };

      // 调用智谱AI绘画API
      const response = await fetch(DRAW_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DRAW_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
      }

      // 解析响应数据
      const data = await response.json();
      
      // 提取生成的图像URL
      const imageUrl = data.data?.[0]?.url || '';
      
      if (!imageUrl) {
        throw new Error('生成图像失败，未返回图像URL');
      }
      
      // 设置生成的图像
      setDrawImage(imageUrl);
      setIsDrawing(false);
    } catch (error) {
      console.error('生成图像失败:', error);
      setDrawError(error.message || '生成图像失败，请稍后重试');
      setIsDrawing(false);
    }
  };


  
  // AI批改相关函数
  
  // 处理图片上传
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCorrectionState(prev => ({ ...prev, isUploading: true, uploadError: '', ocrError: '' }));
    
    // 预览图片
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target.result;
      
      // 先更新状态
      setCorrectionState(prev => ({
        ...prev, 
        image: imageUrl, 
        isUploading: false
      }));
      
      // 直接调用批改API，不再调用OCR扫描，传递图片URL
      handleCorrection(imageUrl);
    };
    reader.onerror = () => {
      setCorrectionState(prev => ({ 
        ...prev, 
        uploadError: '图片上传失败，请重试', 
        isUploading: false 
      }));
    };
    reader.readAsDataURL(file);
  };
  
  // 获取百度OCR API token
  const getBaiduToken = async (apiKey, secretKey) => {
    const tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: secretKey
    });
    
    try {
      const response = await fetch(`${tokenUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (!response.ok) {
        throw new Error(`获取token失败: ${response.status}`);
      }
      
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('获取百度OCR token失败:', error);
      throw error;
    }
  };
  
  // 调用百度OCR API进行扫描
  const handleOCRScan = async (imageUrl) => {
    if (!imageUrl) {
      const { image } = correctionState;
      if (!image) {
        setCorrectionState(prev => ({ ...prev, ocrError: '请先上传图片', isScanning: false }));
        return;
      }
      imageUrl = image;
    }
    
    setCorrectionState(prev => ({ ...prev, isScanning: true, ocrError: '' }));
    
    try {
      // 由于百度OCR API需要真实的API Key，这里我们使用一个模拟的OCR结果
      // 实际项目中需要替换为真实的百度OCR API密钥
      
      // 模拟OCR识别结果
      const ocrText = '题目1：\n内容：下列哪个选项是正确的？\n选项：A. 选项1 B. 选项2 C. 选项3 D. 选项4\n\n题目2：\n内容：请回答以下问题\n选项：A. 答案1 B. 答案2 C. 答案3 D. 答案4';
      
      // 解析OCR结果为题目列表
      const questions = parseOCRToQuestions(ocrText);
      
      // 更新状态
      setCorrectionState(prev => ({
        ...prev,
        ocrText,
        questions,
        showConfirmDialog: true,
        isScanning: false
      }));
    } catch (error) {
      console.error('OCR扫描失败:', error);
      setCorrectionState(prev => ({
        ...prev,
        ocrError: `OCR扫描失败: ${error.message}`,
        isScanning: false
      }));
    }
  };
  
  // 解析OCR结果为题目列表
  const parseOCRToQuestions = (ocrText) => {
    const lines = ocrText.split('\n').filter(line => line.trim());
    const questions = [];
    let currentQuestion = null;
    
    lines.forEach(line => {
      if (line.match(/^\d+\.|^题目\d+/)) {
        // 新题目开始
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          id: questions.length + 1,
          content: line.trim(),
          options: [],
          userAnswer: '',
          correctAnswer: ''
        };
      } else if (currentQuestion && line.match(/^[A-D]\./)) {
        // 选项
        currentQuestion.options.push(line.trim());
      } else if (currentQuestion) {
        // 题目内容或答案
        currentQuestion.content += ' ' + line.trim();
      }
    });
    
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    
    return questions;
  };
  
  // 确认OCR结果
  const confirmOCRResult = (isCorrect) => {
    if (isCorrect) {
      // 进入批改环节
      handleCorrection();
    } else {
      // 重新上传
      setCorrectionState(prev => ({
        ...prev,
        showConfirmDialog: false,
        image: '',
        ocrText: '',
        questions: []
      }));
    }
  };
  
  // 调用批改API
  const handleCorrection = async (imageUrl) => {
    // 优先使用传递的imageUrl，如果没有则从状态中获取
    let image = imageUrl;
    if (!image) {
      image = correctionState.image;
    }
    
    if (!image) {
      setCorrectionState(prev => ({ ...prev, correctionError: '请先上传图片' }));
      return;
    }
    
    setCorrectionState(prev => ({ ...prev, isCorrecting: true, correctionError: '' }));
    
    try {
      // 批改API配置
      const correctionApiKey = '8e70d8084d254508bc1527fa17c690fd.ibq4dfR8eQ3JRcnu';
      const correctionApiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      
      // 构建API请求参数
      const requestData = {
        model: 'glm-4v-flash',
        messages: [
          {
            role: 'system',
            content: '你是一个有用的AI助手。'
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              },
              {
                type: 'text',
                text: '请批改图片中的作业，识别所有题目，判断答案是否正确，并给出详细的批改结果和错误解释。请按照题目序号逐一批改，输出格式清晰易读。'
              }
            ]
          }
        ],
        stream: false,
        temperature: 1
      };
      
      // 调用批改API
      const response = await fetch(correctionApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${correctionApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API错误:', errorData);
        throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
      }
      
      // 解析响应数据
      const data = await response.json();
      const correctionResult = data.choices?.[0]?.message?.content || '';
      
      // 构建批改结果
      const correctionResults = [{
        questionId: 1,
        questionContent: '作业批改',
        isFullScore: true,
        explanation: correctionResult
      }];
      
      // 更新批改结果
      setCorrectionState(prev => ({
        ...prev,
        correctionResults,
        isCorrecting: false
      }));
    } catch (error) {
      console.error('批改失败:', error);
      // 显示错误信息，让用户知道真实的API调用结果
      setCorrectionState(prev => ({
        ...prev,
        correctionError: `批改失败: ${error.message}`,
        isCorrecting: false
      }));
    }
  };
  
  // 重置批改状态
  const resetCorrectionState = () => {
    setCorrectionState({
      image: '',
      isUploading: false,
      uploadError: '',
      isCorrecting: false,
      correctionResults: [],
      correctionError: ''
    });
  };
  
  // 学习计划相关函数
  
  // 处理输入变化
  const handleInputChange = (e) => {
    setStudyPlanState(prev => ({
      ...prev,
      input: e.target.value
    }));
  };
  
  // 生成学习计划
  const handleGenerateStudyPlan = async () => {
    const { input } = studyPlanState;
    
    if (!input.trim()) {
      setStudyPlanState(prev => ({
        ...prev,
        error: '请输入学习需求'
      }));
      return;
    }
    
    setStudyPlanState(prev => ({
      ...prev,
      isGenerating: true,
      error: '',
      result: ''
    }));
    
    try {
      // 学习计划API配置
      const studyPlanApiKey = '8d2dafbbcc8e49f48ef4ad27935e7a17.wL9xyiwGkxpxi9Cb';
      const studyPlanApiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      
      // 构建API请求参数
      const requestData = {
        model: 'glm-4.7-flash',
        messages: [
          {
            role: 'user',
            content: `请根据以下需求为我制定一个详细的学习计划：\n${input}\n\n请生成一个结构清晰、可执行性强的学习计划，包括：\n1. 整体学习目标\n2. 阶段性学习计划\n3. 每日学习安排\n4. 学习方法建议\n5. 评估和调整机制`
          }
        ],
        thinking: {
          type: 'enabled'
        },
        max_tokens: 65536,
        temperature: 1.0
      };
      
      // 调用API
      const response = await fetch(studyPlanApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studyPlanApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
      }
      
      // 解析响应数据
      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || '';
      
      // 更新状态
      setStudyPlanState(prev => ({
        ...prev,
        result,
        isGenerating: false
      }));
    } catch (error) {
      console.error('生成学习计划失败:', error);
      setStudyPlanState(prev => ({
        ...prev,
        error: `生成学习计划失败: ${error.message}`,
        isGenerating: false
      }));
    }
  };
  
  // 重置学习计划状态
  const resetStudyPlanState = () => {
    setStudyPlanState({
      input: '',
      isGenerating: false,
      result: '',
      error: ''
    });
  };

  return React.createElement('div', { className: 'app' }, [
    // 导航栏
    React.createElement('nav', { className: 'navbar' }, [
      React.createElement('button', {
        className: 'navbar-logo',
        onClick: () => handleNavClick('home')
      }, [
        React.createElement('img', { src: 'logo.png', alt: '辰光未来星', className: 'logo-image' })
      ]),
      React.createElement('ul', { className: 'navbar-nav' }, [
        React.createElement('li', null, React.createElement('button', {
          className: currentPage === 'home' ? 'nav-active' : '',
          onClick: () => handleNavClick('home')
        }, '首页')),
        React.createElement('li', null, React.createElement('button', {
          className: currentPage === 'features' ? 'nav-active' : '',
          onClick: () => handleNavClick('features')
        }, '功能')),
        React.createElement('li', null, React.createElement('button', {
          className: currentPage === 'about' ? 'nav-active' : '',
          onClick: () => handleNavClick('about')
        }, '关于')),
        React.createElement('li', null, React.createElement('button', {
          onClick: () => window.open('https://wj.qq.com/s2/25717989/e410/', '_blank')
        }, '工单反馈'))
      ]),
      React.createElement('button', {
        className: 'navbar-btn',
        onClick: () => handleNavClick('features')
      }, '开始使用')
    ]),

    // 页面内容
    currentPage === 'home' && renderHomePage(handleNavClick),
    currentPage === 'features' && renderFeaturesPage(handleNavClick),
    currentPage === 'chat' && renderChatPage(messages, inputValue, isLoading, setInputValue, handleSendMessage, handleKeyPress, messagesEndRef),
    currentPage === 'draw' && renderDrawPage(drawPrompt, drawImage, isDrawing, drawError, setDrawPrompt, handleDrawImage),
    currentPage === 'correction' && renderCorrectionPage(correctionState, setCorrectionState, handleImageUpload, null, null, handleCorrection, resetCorrectionState),
    currentPage === 'study-plan' && renderStudyPlanPage(studyPlanState, setStudyPlanState, handleGenerateStudyPlan, handleInputChange, resetStudyPlanState),
    currentPage === 'about' && React.createElement('section', { className: 'features' }, [
      React.createElement('h2', null, '关于我们'),
      isLoadingAbout ? (
        React.createElement('div', { className: 'loading' }, [
          '加载中',
          React.createElement('div', { className: 'loading-dots' }, [
            React.createElement('div', { className: 'loading-dot' }),
            React.createElement('div', { className: 'loading-dot' }),
            React.createElement('div', { className: 'loading-dot' })
          ])
        ])
      ) : aboutError ? (
        React.createElement('div', {
          style: {
            color: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid #f44336',
            borderRadius: 'var(--border-radius)',
            padding: '1rem',
            marginBottom: '1rem'
          }
        }, aboutError)
      ) : (
        React.createElement('div', {
          style: {
            lineHeight: '1.8',
            fontSize: '1.1rem',
            whiteSpace: 'pre-wrap'
          }
        }, aboutContent)
      )
    ]),
    
    // 底部GitHub链接
    React.createElement('footer', {
      style: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.95))',
        borderTop: '1px solid var(--border-color)',
        padding: '2rem',
        textAlign: 'center',
        marginTop: '4rem',
        boxShadow: 'var(--shadow-md)'
      }
    }, [
      React.createElement('a', {
        href: 'https://github.com/hzdczsr/chenguang-futurestar',
        target: '_blank',
        rel: 'noopener noreferrer',
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          textDecoration: 'none',
          color: 'var(--text-color)',
          transition: 'var(--transition)',
          padding: '1rem',
          borderRadius: 'var(--border-radius)'
        },
        onMouseEnter: (e) => {
          e.target.style.backgroundColor = 'rgba(0, 120, 212, 0.1)';
          e.target.style.transform = 'translateY(-2px)';
        },
        onMouseLeave: (e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.transform = 'translateY(0)';
        }
      }, [
        React.createElement('img', {
          src: 'github.png',
          alt: 'GitHub',
          style: {
            width: '32px',
            height: '32px',
            borderRadius: 'var(--border-radius)'
          }
        }),
        React.createElement('span', {
          style: {
            fontSize: '1rem',
            fontWeight: '500'
          }
        }, '"辰光未来星"已被作者永久托管至GitHub，请放心使用（网站版本：2.0.0Beta（非对外发行版） 更新日期：2026年2月13日）')
      ])
    ])
  ]);
}

// 渲染应用
ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null, React.createElement(App))
);