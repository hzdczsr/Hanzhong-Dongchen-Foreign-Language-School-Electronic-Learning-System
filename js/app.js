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
  
  // 早读助手状态
  const [morningReadingState, setMorningReadingState] = React.useState({
    // 时间设置
    timeMinutes: 10,
    timeSeconds: 0,
    // 倒计时状态
    isCounting: false,
    remainingTime: 10 * 60, // 秒
    // 音量监测
    currentVolume: 0,
    maxVolume: 0,
    // 激励状态
    treesPlanted: 0,
    // 错误信息
    error: ''
  });
  
  // 登录/注册对话框状态
  const [authDialogState, setAuthDialogState] = React.useState({
    show: false,
    mode: 'login', // 'login' 或 'register'
    username: '',
    password: '',
    confirmPassword: '',
    isLoading: false,
    error: '',
    success: ''
  });
  
  // 当前登录用户状态
  const [currentUser, setCurrentUser] = React.useState(null);
  
  // 每日新闻弹窗状态
  const [newsDialogState, setNewsDialogState] = React.useState({
    show: true,
    imageUrl: '',
    isLoading: true,
    error: ''
  });
  
  // 更新日志状态
  const [updatelogState, setUpdatelogState] = React.useState({
    content: '',
    isLoading: false,
    error: ''
  });
  
  // 时空功能状态
  const [timeSpaceState, setTimeSpaceState] = React.useState({
    beijingTime: null,
    localTime: null,
    isLoading: true,
    error: ''
  });
  
  // AI测评功能状态
  const [aiAssessmentState, setAiAssessmentState] = React.useState({
    // 选择状态
    step: 'select', // select, generating, answering, analyzing, result
    selectedStage: '',
    selectedDifficulty: '',
    selectedSubject: '',
    
    // 题目状态
    questions: [],
    userAnswers: {},
    
    // 解析状态
    analysis: '',
    isGenerating: false,
    isAnalyzing: false,
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
  
  // 倒计时逻辑
  React.useEffect(() => {
    let intervalId;
    
    if (morningReadingState.isCounting && morningReadingState.remainingTime > 0) {
      intervalId = setInterval(() => {
        setMorningReadingState(prev => {
          if (prev.remainingTime <= 1) {
            clearInterval(intervalId);
            return {
              ...prev,
              remainingTime: 0,
              isCounting: false
            };
          }
          return {
            ...prev,
            remainingTime: prev.remainingTime - 1
          };
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [morningReadingState.isCounting, morningReadingState.remainingTime]);
  
  // 音量监测逻辑（模拟）
  React.useEffect(() => {
    let volumeIntervalId;
    
    if (morningReadingState.isCounting) {
      // 每1秒模拟一次音量监测
      volumeIntervalId = setInterval(() => {
        simulateVolumeMonitoring();
      }, 1000);
    }
    
    return () => {
      if (volumeIntervalId) {
        clearInterval(volumeIntervalId);
      }
    };
  }, [morningReadingState.isCounting]);

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
        try {
          const errorData = await response.json();
          console.error('API错误:', errorData);
          const errorMessage = errorData.error?.message || errorData.message || `API请求失败`;
          const errorCode = errorData.error?.code || errorData.code || response.status;
          throw new Error(`API错误 [${errorCode}]: ${errorMessage}\n可能原因: API密钥无效或已过期，或API服务暂时不可用\n解决方案: 检查API密钥是否正确，或稍后重试`);
        } catch (jsonError) {
          console.error('解析错误响应失败:', jsonError);
          throw new Error(`API请求失败 [${response.status}]: ${response.statusText}\n可能原因: 网络连接问题或API服务异常\n解决方案: 检查网络连接，或稍后重试`);
        }
      }

      // 解析响应数据
      try {
        const data = await response.json();
        
        // 检查响应数据格式
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          throw new Error('API返回数据格式异常\n可能原因: API响应结构发生变化\n解决方案: 请联系系统管理员');
        }
        
        // 提取AI的回答
        const aiContent = data.choices[0]?.message?.content || '';
        
        if (!aiContent) {
          throw new Error('API返回空结果\n可能原因: 输入内容无法处理或API处理失败\n解决方案: 尝试修改输入内容，或稍后重试');
        }
        
        // 添加AI消息
        const aiMessage = new Message(
          (Date.now() + 1).toString(),
          'ai',
          aiContent
        );
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      } catch (parseError) {
        console.error('解析响应数据失败:', parseError);
        throw new Error(`解析响应数据失败: ${parseError.message}\n可能原因: API返回数据格式错误\n解决方案: 稍后重试，或联系系统管理员`);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 区分不同类型的错误
      let errorMessage = error.message;
      
      if (error.message.includes('NetworkError') || error.message.includes('网络') || error.message.includes('fetch')) {
        errorMessage = `网络错误: ${error.message}\n可能原因: 网络连接不稳定或API服务器无响应\n解决方案: 检查网络连接，确保您可以访问互联网，然后重试`;
      } else if (error.message.includes('Authorization') || error.message.includes('401') || error.message.includes('403')) {
        errorMessage = `认证错误: ${error.message}\n可能原因: API密钥无效、已过期或权限不足\n解决方案: 请联系系统管理员检查API密钥配置`;
      } else if (error.message.includes('429')) {
        errorMessage = `请求频率限制: ${error.message}\n可能原因: 短时间内发送了过多请求\n解决方案: 请稍后再试，避免频繁提交相同的请求`;
      }
      
      // 添加错误消息
      const errorMessageObj = new Message(
        (Date.now() + 1).toString(),
        'ai',
        `抱歉，AI服务暂时不可用。错误信息：\n${errorMessage}`
      );
      setMessages(prev => [...prev, errorMessageObj]);
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

  // Supabase配置
  const SUPABASE_URL = 'https://bmkdfxvilcaigonrzxfl.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJta2RmeHZpbGNhaWdvbnJ6eGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNTIyMDksImV4cCI6MjA4NzcyODIwOX0.ZBEt0i4JAEBzY75zgh2-MSC7ofcqKKuh0-_9HaAnzTY';

  // 处理登录/注册提交
  const handleAuthSubmit = async () => {
    const { mode, username, password, confirmPassword } = authDialogState;
    
    // 表单验证
    if (!username.trim()) {
      setAuthDialogState(prev => ({ ...prev, error: '请输入用户名' }));
      return;
    }
    if (!password.trim()) {
      setAuthDialogState(prev => ({ ...prev, error: '请输入密码' }));
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setAuthDialogState(prev => ({ ...prev, error: '两次输入的密码不一致' }));
      return;
    }
    if (username.trim().length < 3) {
      setAuthDialogState(prev => ({ ...prev, error: '用户名至少需要3个字符' }));
      return;
    }
    if (password.length < 6) {
      setAuthDialogState(prev => ({ ...prev, error: '密码至少需要6个字符' }));
      return;
    }

    setAuthDialogState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      if (mode === 'register') {
        // 注册流程
        // 1. 先检查用户名是否已存在
        const originalUsername = username.trim();
        
        console.log('检查用户名:', { original: originalUsername });
        
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(originalUsername)}`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
        
        if (!checkResponse.ok) {
          throw new Error('检查用户名失败');
        }
        
        const existingUsers = await checkResponse.json();
        if (existingUsers.length > 0) {
          setAuthDialogState(prev => ({ ...prev, isLoading: false, error: '该用户名已被注册' }));
          return;
        }

        // 2. 创建auth用户
        // 处理用户名，支持中文
        const registerOriginalUsername = username.trim();
        // 为邮箱生成使用字母数字版本（移除所有非字母数字字符）
        const emailUsername = registerOriginalUsername.replace(/[^a-zA-Z0-9]/g, '');
        // 确保邮箱用户名为空时使用时间戳
        const finalEmailUsername = emailUsername || 'user_' + Date.now();
        const email = `${finalEmailUsername}@chenguang.com`;
        
        console.log('注册信息:', { original: registerOriginalUsername, emailUsername: finalEmailUsername, email: email });
        
        // 带重试机制的注册请求
        let authResponse;
        let retryCount = 0;
        const maxRetries = 3;
        const baseDelay = 2000; // 基础延迟2秒
        
        while (retryCount < maxRetries) {
          authResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: email,
              password: password
            })
          });

          console.log('注册响应状态:', authResponse.status, '重试次数:', retryCount);
          
          // 如果不是429错误，直接跳出循环
          if (authResponse.status !== 429) {
            break;
          }
          
          // 429错误，等待后重试
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount - 1); // 指数退避: 2s, 4s, 8s
            console.log(`遇到429错误，等待${delay}ms后重试...`);
            setAuthDialogState(prev => ({ 
              ...prev, 
              error: `请求过于频繁，${delay/1000}秒后自动重试...(${retryCount}/${maxRetries})` 
            }));
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        
        if (!authResponse.ok) {
          try {
            const errorData = await authResponse.json();
            console.error('注册失败详细信息:', errorData);
            
            // 处理429错误
            if (authResponse.status === 429) {
              throw new Error('请求过于频繁，请稍后再试（已重试3次）');
            }
            
            throw new Error(errorData.msg || errorData.error || errorData.message || '注册失败');
          } catch (jsonError) {
            const text = await authResponse.text().catch(() => '');
            console.error('注册失败响应文本:', text);
            
            // 处理429错误
            if (authResponse.status === 429) {
              throw new Error('请求过于频繁，请稍后再试（已重试3次）');
            }
            
            throw new Error(`注册失败: ${authResponse.status} ${authResponse.statusText}`);
          }
        }

        const authData = await authResponse.json();
        
        if (authData.user) {
          // 3. 更新profiles记录中的username字段
          // handle_new_user触发器已经创建了记录，现在需要更新username
          const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${authData.user.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              username: registerOriginalUsername
            })
          });

          if (!profileResponse.ok) {
            const errorData = await profileResponse.json().catch(() => ({}));
            console.error('更新用户资料失败:', errorData);
            throw new Error(`更新用户资料失败: ${errorData.message || JSON.stringify(errorData)}`);
          }

          setAuthDialogState(prev => ({ 
            ...prev, 
            isLoading: false, 
            success: '注册成功！请登录',
            mode: 'login',
            password: '',
            confirmPassword: ''
          }));
        }
      } else {
        // 登录流程
        // 处理用户名，支持中文
        const originalUsername = username.trim();
        // 为邮箱生成使用字母数字版本（移除所有非字母数字字符）
        const emailUsername = originalUsername.replace(/[^a-zA-Z0-9]/g, '');
        // 确保邮箱用户名为空时使用时间戳
        const finalEmailUsername = emailUsername || 'user_' + Date.now();
        const email = `${finalEmailUsername}@chenguang.com`;
        
        console.log('登录信息:', { original: originalUsername, emailUsername: finalEmailUsername, email: email });
        
        const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        });

        if (!loginResponse.ok) {
          try {
            const errorData = await loginResponse.json();
            
            // 处理429错误
            if (loginResponse.status === 429) {
              setAuthDialogState(prev => ({ ...prev, isLoading: false, error: '请求过于频繁，请稍后再试' }));
              return;
            }
            
            if (errorData.msg && errorData.msg.includes('Invalid login credentials')) {
              setAuthDialogState(prev => ({ ...prev, isLoading: false, error: '用户名或密码错误' }));
            } else {
              throw new Error(errorData.msg || '登录失败');
            }
          } catch (error) {
            // 处理429错误
            if (loginResponse.status === 429) {
              setAuthDialogState(prev => ({ ...prev, isLoading: false, error: '请求过于频繁，请稍后再试' }));
            } else {
              throw new Error(`登录失败: ${loginResponse.status} ${loginResponse.statusText}`);
            }
          }
          return;
        }

        const loginData = await loginResponse.json();
        
        if (loginData.user) {
          // 获取用户资料
          const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${loginData.user.id}`, {
            method: 'GET',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${loginData.access_token}`
            }
          });

          if (profileResponse.ok) {
            const profiles = await profileResponse.json();
            if (profiles.length > 0) {
              const user = {
                id: loginData.user.id,
                username: profiles[0].username,
                token: loginData.access_token
              };
              setCurrentUser(user);
              localStorage.setItem('currentUser', JSON.stringify(user));
              
              setAuthDialogState(prev => ({ 
                ...prev, 
                show: false, 
                isLoading: false,
                username: '',
                password: '',
                confirmPassword: '',
                error: '',
                success: ''
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error('认证错误:', error);
      setAuthDialogState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: `操作失败: ${error.message}` 
      }));
    }
  };

  // 组件挂载时检查本地存储的登录状态
  React.useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

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
    } else if (page === 'morning-reading') {
      resetMorningReadingState();
    } else if (page === 'updatelog') {
      // 可以在这里添加更新日志页面的状态重置逻辑
    } else if (page === 'time-space') {
      // 可以在这里添加时空页面的状态重置逻辑
    } else if (page === 'ai-assessment') {
      // 重置AI测评状态
      setAiAssessmentState({
        step: 'select',
        selectedStage: '',
        selectedDifficulty: '',
        selectedSubject: '',
        questions: [],
        userAnswers: {},
        analysis: '',
        isGenerating: false,
        isAnalyzing: false,
        error: ''
      });
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
        try {
          const errorData = await response.json();
          console.error('API错误:', errorData);
          const errorMessage = errorData.error?.message || errorData.message || `API请求失败`;
          const errorCode = errorData.error?.code || errorData.code || response.status;
          throw new Error(`API错误 [${errorCode}]: ${errorMessage}\n可能原因: API密钥无效或已过期，或API服务暂时不可用\n解决方案: 检查API密钥是否正确，或稍后重试`);
        } catch (jsonError) {
          console.error('解析错误响应失败:', jsonError);
          throw new Error(`API请求失败 [${response.status}]: ${response.statusText}\n可能原因: 网络连接问题或API服务异常\n解决方案: 检查网络连接，或稍后重试`);
        }
      }

      // 解析响应数据
      try {
        const data = await response.json();
        
        // 检查响应数据格式
        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
          throw new Error('API返回数据格式异常\n可能原因: API响应结构发生变化\n解决方案: 请联系系统管理员');
        }
        
        // 提取生成的图像URL
        const imageUrl = data.data[0]?.url || '';
        
        if (!imageUrl) {
          throw new Error('生成图像失败，未返回图像URL\n可能原因: 提示词内容不合适或API处理失败\n解决方案: 尝试修改提示词，或稍后重试');
        }
        
        // 设置生成的图像
        setDrawImage(imageUrl);
        setIsDrawing(false);
      } catch (parseError) {
        console.error('解析响应数据失败:', parseError);
        throw new Error(`解析响应数据失败: ${parseError.message}\n可能原因: API返回数据格式错误\n解决方案: 稍后重试，或联系系统管理员`);
      }
    } catch (error) {
      console.error('生成图像失败:', error);
      
      // 区分不同类型的错误
      let errorMessage = error.message;
      
      if (error.message.includes('NetworkError') || error.message.includes('网络') || error.message.includes('fetch')) {
        errorMessage = `网络错误: ${error.message}\n可能原因: 网络连接不稳定或API服务器无响应\n解决方案: 检查网络连接，确保您可以访问互联网，然后重试`;
      } else if (error.message.includes('Authorization') || error.message.includes('401') || error.message.includes('403')) {
        errorMessage = `认证错误: ${error.message}\n可能原因: API密钥无效、已过期或权限不足\n解决方案: 请联系系统管理员检查API密钥配置`;
      } else if (error.message.includes('429')) {
        errorMessage = `请求频率限制: ${error.message}\n可能原因: 短时间内发送了过多请求\n解决方案: 请稍后再试，避免频繁提交相同的请求`;
      }
      
      setDrawError(errorMessage);
      setIsDrawing(false);
    }
  };


  
  // AI批改相关函数
  
  // 处理图片上传
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCorrectionState(prev => ({ ...prev, isUploading: true, uploadError: '' }));
    
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
      
      // 直接调用批改API，传递图片URL
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
        model: 'glm-4.6v-flash',
        messages: [
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
        thinking: {
          type: 'enabled'
        }
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
        try {
          const errorData = await response.json();
          console.error('API错误:', errorData);
          const errorMessage = errorData.error?.message || errorData.message || `API请求失败`;
          const errorCode = errorData.error?.code || errorData.code || response.status;
          throw new Error(`API错误 [${errorCode}]: ${errorMessage}\n可能原因: API密钥无效或已过期，或API服务暂时不可用\n解决方案: 检查API密钥是否正确，或稍后重试`);
        } catch (jsonError) {
          console.error('解析错误响应失败:', jsonError);
          throw new Error(`API请求失败 [${response.status}]: ${response.statusText}\n可能原因: 网络连接问题或API服务异常\n解决方案: 检查网络连接，或稍后重试`);
        }
      }
      
      // 解析响应数据
      try {
        const data = await response.json();
        
        // 检查响应数据格式
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          throw new Error('API返回数据格式异常\n可能原因: API响应结构发生变化\n解决方案: 请联系系统管理员');
        }
        
        const correctionResult = data.choices[0]?.message?.content || '';
        
        if (!correctionResult) {
          throw new Error('API返回空结果\n可能原因: 图片内容无法识别或API处理失败\n解决方案: 尝试上传清晰的图片，或稍后重试');
        }
        
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
      } catch (parseError) {
        console.error('解析响应数据失败:', parseError);
        throw new Error(`解析响应数据失败: ${parseError.message}\n可能原因: API返回数据格式错误\n解决方案: 稍后重试，或联系系统管理员`);
      }
    } catch (error) {
      console.error('批改失败:', error);
      
      // 区分不同类型的错误
      let errorMessage = error.message;
      
      if (error.message.includes('NetworkError') || error.message.includes('网络') || error.message.includes('fetch')) {
        errorMessage = `网络错误: ${error.message}\n可能原因: 网络连接不稳定或API服务器无响应\n解决方案: 检查网络连接，确保您可以访问互联网，然后重试`;
      } else if (error.message.includes('Authorization') || error.message.includes('401') || error.message.includes('403')) {
        errorMessage = `认证错误: ${error.message}\n可能原因: API密钥无效、已过期或权限不足\n解决方案: 请联系系统管理员检查API密钥配置`;
      } else if (error.message.includes('429')) {
        errorMessage = `请求频率限制: ${error.message}\n可能原因: 短时间内发送了过多请求\n解决方案: 请稍后再试，避免频繁提交相同的请求`;
      }
      
      // 显示详细错误信息
      setCorrectionState(prev => ({
        ...prev,
        correctionError: errorMessage,
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
        try {
          const errorData = await response.json();
          console.error('API错误:', errorData);
          const errorMessage = errorData.error?.message || errorData.message || `API请求失败`;
          const errorCode = errorData.error?.code || errorData.code || response.status;
          throw new Error(`API错误 [${errorCode}]: ${errorMessage}\n可能原因: API密钥无效或已过期，或API服务暂时不可用\n解决方案: 检查API密钥是否正确，或稍后重试`);
        } catch (jsonError) {
          console.error('解析错误响应失败:', jsonError);
          throw new Error(`API请求失败 [${response.status}]: ${response.statusText}\n可能原因: 网络连接问题或API服务异常\n解决方案: 检查网络连接，或稍后重试`);
        }
      }
      
      // 解析响应数据
      try {
        const data = await response.json();
        
        // 检查响应数据格式
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          throw new Error('API返回数据格式异常\n可能原因: API响应结构发生变化\n解决方案: 请联系系统管理员');
        }
        
        const result = data.choices[0]?.message?.content || '';
        
        if (!result) {
          throw new Error('API返回空结果\n可能原因: 输入内容无法处理或API处理失败\n解决方案: 尝试修改输入内容，或稍后重试');
        }
        
        // 更新状态
        setStudyPlanState(prev => ({
          ...prev,
          result,
          isGenerating: false
        }));
      } catch (parseError) {
        console.error('解析响应数据失败:', parseError);
        throw new Error(`解析响应数据失败: ${parseError.message}\n可能原因: API返回数据格式错误\n解决方案: 稍后重试，或联系系统管理员`);
      }
    } catch (error) {
      console.error('生成学习计划失败:', error);
      
      // 区分不同类型的错误
      let errorMessage = error.message;
      
      if (error.message.includes('NetworkError') || error.message.includes('网络') || error.message.includes('fetch')) {
        errorMessage = `网络错误: ${error.message}\n可能原因: 网络连接不稳定或API服务器无响应\n解决方案: 检查网络连接，确保您可以访问互联网，然后重试`;
      } else if (error.message.includes('Authorization') || error.message.includes('401') || error.message.includes('403')) {
        errorMessage = `认证错误: ${error.message}\n可能原因: API密钥无效、已过期或权限不足\n解决方案: 请联系系统管理员检查API密钥配置`;
      } else if (error.message.includes('429')) {
        errorMessage = `请求频率限制: ${error.message}\n可能原因: 短时间内发送了过多请求\n解决方案: 请稍后再试，避免频繁提交相同的请求`;
      }
      
      setStudyPlanState(prev => ({
        ...prev,
        error: errorMessage,
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
  
  // 重置早读助手状态
  const resetMorningReadingState = () => {
    setMorningReadingState({
      timeMinutes: 10,
      timeSeconds: 0,
      isCounting: false,
      remainingTime: 10 * 60,
      currentVolume: 0,
      maxVolume: 0,
      treesPlanted: 0,
      error: ''
    });
  };
  
  // 渲染早读助手页面
  const renderMorningReadingPage = () => {
    const { timeMinutes, timeSeconds, isCounting, remainingTime, currentVolume, treesPlanted, error } = morningReadingState;
    
    // 格式化剩余时间
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    return React.createElement('section', { className: 'ai-chat' }, [
      React.createElement('div', { className: 'ai-chat-container' }, [
        React.createElement('div', { className: 'ai-chat-header' }, '早读助手'),
        
        React.createElement('div', { style: { padding: '1.75rem' } }, [
          // 错误提示
          error && React.createElement('div', {
            style: {
              color: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #f44336',
              borderRadius: 'var(--border-radius)',
              padding: '1rem',
              marginBottom: '1.5rem'
            }
          }, error),
          
          // 时间设置
          React.createElement('div', {
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: 'var(--border-radius)',
              padding: '2rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)'
            }
          }, [
            React.createElement('h3', {
              style: {
                color: 'var(--text-color)',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }
            }, '设置早读时间'),
            
            React.createElement('div', {
              style: {
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }
            }, [
              // 分钟设置
              React.createElement('div', {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }
              }, [
                React.createElement('label', {
                  style: {
                    color: 'var(--text-color)',
                    fontWeight: '500'
                  }
                }, '分钟'),
                React.createElement('input', {
                  type: 'number',
                  value: timeMinutes,
                  onChange: (e) => handleTimeChange('minutes', e.target.value),
                  min: 1,
                  max: 60,
                  disabled: isCounting,
                  style: {
                    width: '100px',
                    padding: '0.75rem',
                    textAlign: 'center',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1.1rem'
                  }
                })
              ]),
              
              React.createElement('div', {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1.5rem',
                  color: 'var(--text-color)'
                }
              }, ':'),
              
              // 秒数设置
              React.createElement('div', {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }
              }, [
                React.createElement('label', {
                  style: {
                    color: 'var(--text-color)',
                    fontWeight: '500'
                  }
                }, '秒'),
                React.createElement('input', {
                  type: 'number',
                  value: timeSeconds,
                  onChange: (e) => handleTimeChange('seconds', e.target.value),
                  min: 0,
                  max: 59,
                  disabled: isCounting,
                  style: {
                    width: '100px',
                    padding: '0.75rem',
                    textAlign: 'center',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1.1rem'
                  }
                })
              ])
            ]),
            
            // 控制按钮
            React.createElement('div', {
              style: {
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '1rem'
              }
            }, [
              React.createElement('button', {
                onClick: handleToggleCountdown,
                style: {
                  padding: '0.875rem 2rem',
                  backgroundColor: isCounting ? '#ff9800' : 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }
              }, isCounting ? '暂停' : '开始'),
              
              React.createElement('button', {
                onClick: handleResetCountdown,
                style: {
                  padding: '0.875rem 2rem',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }
              }, '重置'),
              
              React.createElement('button', {
                onClick: handleStopCountdown,
                disabled: !isCounting,
                style: {
                  padding: '0.875rem 2rem',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: !isCounting ? 'not-allowed' : 'pointer',
                  opacity: !isCounting ? 0.6 : 1,
                  transition: 'var(--transition)'
                }
              }, '停止')
            ])
          ]),
          
          // 倒计时显示
          React.createElement('div', {
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: 'var(--border-radius)',
              padding: '2rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center'
            }
          }, [
            React.createElement('h3', {
              style: {
                color: 'var(--text-color)',
                marginBottom: '1.5rem'
              }
            }, '剩余时间'),
            React.createElement('div', {
              style: {
                fontSize: '3rem',
                fontWeight: 'bold',
                color: isCounting && remainingTime < 60 ? '#f44336' : 'var(--text-color)',
                marginBottom: '1rem'
              }
            }, formatTime(remainingTime)),
            
            // 音量监测
            React.createElement('div', {
              style: {
                marginTop: '1.5rem'
              }
            }, [
              React.createElement('h4', {
                style: {
                  color: 'var(--text-color)',
                  marginBottom: '1rem'
                }
              }, '音量监测'),
              React.createElement('div', {
                style: {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem'
                }
              }, [
                React.createElement('div', {
                  style: {
                    fontSize: '2rem'
                  }
                }, '🔊'),
                React.createElement('div', {
                  style: {
                    fontSize: '1.5rem',
                    fontWeight: '500',
                    color: currentVolume > 50 ? '#4CAF50' : 'var(--text-color)'
                  }
                }, `${currentVolume} dB`),
                React.createElement('div', {
                  style: {
                    width: '200px',
                    height: '20px',
                    backgroundColor: 'var(--border-color)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }
                }, [
                  React.createElement('div', {
                    style: {
                      width: `${Math.min(currentVolume, 100)}%`,
                      height: '100%',
                      backgroundColor: currentVolume > 50 ? '#4CAF50' : 'var(--primary-color)',
                      borderRadius: '10px',
                      transition: 'width 0.3s ease'
                    }
                  })
                ])
              ])
            ])
          ]),
          
          // 植树激励
          React.createElement('div', {
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: 'var(--border-radius)',
              padding: '2rem',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)'
            }
          }, [
            React.createElement('h3', {
              style: {
                color: 'var(--text-color)',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }
            }, '激励植树'),
            
            React.createElement('div', {
              style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }
            }, [
              React.createElement('div', {
                style: {
                  fontSize: '3rem'
                }
              }, '🌳'),
              React.createElement('div', {
                style: {
                  fontSize: '1.5rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }
              }, `已种植 ${treesPlanted} 棵树`)
            ]),
            
            React.createElement('p', {
              style: {
                color: 'var(--text-secondary-color)',
                textAlign: 'center',
                fontSize: '0.95rem'
              }
            }, '当音量大于50dB时，会自动种植一棵树作为激励！')
          ])
        ])
      ])
    ]);
  };
  
  // 早读助手相关函数
  
  // 处理时间设置变化
  const handleTimeChange = (type, value) => {
    setMorningReadingState(prev => {
      let newMinutes = prev.timeMinutes;
      let newSeconds = prev.timeSeconds;
      
      if (type === 'minutes') {
        newMinutes = Math.max(1, Math.min(60, parseInt(value) || 1));
      } else if (type === 'seconds') {
        newSeconds = Math.max(0, Math.min(59, parseInt(value) || 0));
      }
      
      return {
        ...prev,
        [type]: parseInt(value) || 0,
        remainingTime: newMinutes * 60 + newSeconds
      };
    });
  };
  
  // 开始/暂停倒计时
  const handleToggleCountdown = () => {
    setMorningReadingState(prev => ({
      ...prev,
      isCounting: !prev.isCounting
    }));
  };
  
  // 停止倒计时
  const handleStopCountdown = () => {
    setMorningReadingState(prev => ({
      ...prev,
      isCounting: false
    }));
  };
  
  // 重置倒计时
  const handleResetCountdown = () => {
    setMorningReadingState(prev => ({
      ...prev,
      isCounting: false,
      remainingTime: prev.timeMinutes * 60 + prev.timeSeconds,
      currentVolume: 0,
      maxVolume: 0,
      treesPlanted: 0,
      error: ''
    }));
  };
  
  // 植树激励函数
  const plantTree = () => {
    setMorningReadingState(prev => ({
      ...prev,
      treesPlanted: prev.treesPlanted + 1
    }));
  };
  
  // 模拟音量监测（实际项目中需要使用Web Audio API）
  const simulateVolumeMonitoring = () => {
    // 这里只是模拟，实际项目中需要使用Web Audio API获取真实的音量
    const randomVolume = Math.floor(Math.random() * 80);
    setMorningReadingState(prev => {
      const newState = {
        ...prev,
        currentVolume: randomVolume,
        maxVolume: Math.max(prev.maxVolume, randomVolume)
      };
      
      // 当音量大于50db时，种树
      if (randomVolume > 50) {
        newState.treesPlanted = prev.treesPlanted + 1;
      }
      
      return newState;
    });
  };
  
  // 读取更新日志
  const loadUpdatelog = async () => {
    setUpdatelogState(prev => ({ ...prev, isLoading: true, error: '' }));
    try {
      // 检查是否从file://协议运行
      if (window.location.protocol === 'file:') {
        // 从file://运行时，使用默认内容
        const defaultContent = `# 更新日志

## 2026年2月26日
- 添加了更新日志功能
- 修复了AI批改功能的错误处理
- 优化了网站加载速度

## 2026年2月14日
- 添加了早读助手功能
- 改进了错误提示机制
- 优化了UI界面

## 2026年2月1日
- 网站正式上线
- 添加了AI智能对话功能
- 添加了AI绘画功能
- 添加了AI批改功能
- 添加了学习计划功能`;
        setUpdatelogState(prev => ({ ...prev, content: defaultContent, isLoading: false }));
      } else {
        // 从HTTP服务器运行时，读取真实文件
        const response = await fetch('updatelog.txt');
        if (!response.ok) {
          throw new Error(`文件读取失败: ${response.status}`);
        }
        const content = await response.text();
        setUpdatelogState(prev => ({ ...prev, content: content || '暂无更新日志', isLoading: false }));
      }
    } catch (error) {
      console.error('读取更新日志失败:', error);
      // 发生错误时使用默认内容
      const defaultContent = `# 更新日志

## 2026年2月26日
- 添加了更新日志功能
- 修复了AI批改功能的错误处理
- 优化了网站加载速度

## 2026年2月14日
- 添加了早读助手功能
- 改进了错误提示机制
- 优化了UI界面

## 2026年2月1日
- 网站正式上线
- 添加了AI智能对话功能
- 添加了AI绘画功能
- 添加了AI批改功能
- 添加了学习计划功能`;
      setUpdatelogState(prev => ({ ...prev, content: defaultContent, isLoading: false, error: '' }));
    }
  };
  
  // 当导航到更新日志页面时加载内容
  React.useEffect(() => {
    if (currentPage === 'updatelog') {
      loadUpdatelog();
    }
  }, [currentPage]);
  
  // 获取每日新闻图片
  const fetchDailyNewsImage = async () => {
    setNewsDialogState(prev => ({ ...prev, isLoading: true, error: '' }));
    try {
      const response = await fetch('https://uapis.cn/api/v1/daily/news-image', {
        method: 'GET',
        headers: {
          'Accept': 'image/jpeg'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      // 将响应转换为blob，然后创建URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      setNewsDialogState(prev => ({ 
        ...prev, 
        imageUrl, 
        isLoading: false 
      }));
    } catch (error) {
      console.error('获取每日新闻图片失败:', error);
      setNewsDialogState(prev => ({ 
        ...prev, 
        error: `获取每日新闻图片失败: ${error.message}`, 
        isLoading: false 
      }));
    }
  };
  
  // 组件挂载时获取每日新闻图片
  React.useEffect(() => {
    fetchDailyNewsImage();
  }, []);
  
  // 获取北京时间
  const fetchBeijingTime = async () => {
    setTimeSpaceState(prev => ({ ...prev, isLoading: true, error: '' }));
    try {
      const response = await fetch('https://uapis.cn/api/v1/misc/worldtime?city=Asia%2FShanghai');
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      const data = await response.json();
      
      // 解析时间字符串
      const timeStr = data.datetime;
      const date = new Date(timeStr);
      
      // 计算星期几
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const week = weekdays[date.getDay()];
      
      // 构建格式化的时间对象
      const formattedTime = {
        hour: date.getHours().toString().padStart(2, '0'),
        minute: date.getMinutes().toString().padStart(2, '0'),
        second: date.getSeconds().toString().padStart(2, '0'),
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString().padStart(2, '0'),
        day: date.getDate().toString().padStart(2, '0'),
        week: week
      };
      
      setTimeSpaceState(prev => ({ ...prev, beijingTime: formattedTime, localTime: formattedTime, isLoading: false }));
    } catch (error) {
      console.error('获取北京时间失败:', error);
      setTimeSpaceState(prev => ({ ...prev, error: `获取北京时间失败: ${error.message}`, isLoading: false }));
    }
  };
  
  // 本地时间更新函数
  const updateLocalTime = () => {
    setTimeSpaceState(prev => {
      if (!prev.localTime) return prev;
      
      // 解析当前本地时间
      const currentTime = new Date();
      const formattedTime = {
        hour: currentTime.getHours().toString().padStart(2, '0'),
        minute: currentTime.getMinutes().toString().padStart(2, '0'),
        second: currentTime.getSeconds().toString().padStart(2, '0'),
        year: currentTime.getFullYear().toString(),
        month: (currentTime.getMonth() + 1).toString().padStart(2, '0'),
        day: currentTime.getDate().toString().padStart(2, '0'),
        week: prev.localTime.week
      };
      
      return { ...prev, localTime: formattedTime };
    });
  };
  
  // 当导航到时空页面时获取北京时间
  React.useEffect(() => {
    if (currentPage === 'time-space') {
      fetchBeijingTime();
      // 每60秒从API更新一次时间
      const apiIntervalId = setInterval(fetchBeijingTime, 60000);
      // 每秒更新本地时间
      const localIntervalId = setInterval(updateLocalTime, 1000);
      return () => {
        clearInterval(apiIntervalId);
        clearInterval(localIntervalId);
      };
    }
  }, [currentPage]);
  
  // AI测评相关函数
  
  // 生成题目 - 使用智谱AI（支持CORS）
  const generateQuestions = async () => {
    const { selectedStage, selectedDifficulty, selectedSubject } = aiAssessmentState;
    
    if (!selectedStage || !selectedDifficulty || !selectedSubject) {
      setAiAssessmentState(prev => ({ ...prev, error: '请选择完整的测评信息' }));
      return;
    }
    
    setAiAssessmentState(prev => ({ ...prev, isGenerating: true, error: '' }));
    
    try {
      // 智谱AI API配置（支持CORS）
      const API_KEY = '98fddaa6837f4f44b74b77833b41eeb5.v3VlXWgal9CMoGWz';
      const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      
      // 构建API请求参数
      const requestData = {
        model: 'glm-4.7-flash',
        messages: [
          {
            role: 'user',
            content: `请为${selectedStage} ${selectedDifficulty}难度的${selectedSubject}科目生成5道测评题目，包含选择题、填空题和简答题。请按照以下格式返回：\n\n1. 选择题：题目内容\n选项：A. 选项A\nB. 选项B\nC. 选项C\nD. 选项D\n答案：正确选项\n\n2. 填空题：题目内容\n答案：正确答案\n\n3. 简答题：题目内容\n答案：详细解析`
          }
        ],
        thinking: {
          type: 'enabled'
        },
        max_tokens: 65536,
        temperature: 1.0
      };
      
      // 调用智谱AI API（支持CORS）
      console.log('调用智谱AI API生成题目...');
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestData)
      });
      
      // 检查响应状态
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('API错误:', errorData);
          const errorMessage = errorData.error?.message || errorData.message || `API请求失败`;
          const errorCode = errorData.error?.code || errorData.code || response.status;
          throw new Error(`API错误 [${errorCode}]: ${errorMessage}`);
        } catch (jsonError) {
          console.error('解析错误响应失败:', jsonError);
          throw new Error(`API请求失败 [${response.status}]: ${response.statusText}`);
        }
      }
      
      // 解析响应数据
      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // 解析生成的题目
      const questions = parseQuestions(content);
      
      setAiAssessmentState(prev => ({
        ...prev,
        step: 'answering',
        questions,
        userAnswers: {},
        isGenerating: false
      }));
    } catch (error) {
      console.error('生成题目失败:', error);
      setAiAssessmentState(prev => ({
        ...prev,
        error: `生成题目失败: ${error.message}`,
        isGenerating: false
      }));
    }
  };
  
  // 解析生成的题目
  const parseQuestions = (content) => {
    const questions = [];
    const lines = content.split('\n');
    let currentQuestion = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/^\d+\. 选择题：/)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          type: 'multiple-choice',
          content: trimmedLine.replace(/^\d+\. 选择题：/, ''),
          options: [],
          correctAnswer: ''
        };
      } else if (trimmedLine.match(/^选项：/)) {
        // 处理选项
      } else if (trimmedLine.match(/^[A-D]\. /)) {
        if (currentQuestion && currentQuestion.type === 'multiple-choice') {
          currentQuestion.options.push(trimmedLine);
        }
      } else if (trimmedLine.match(/^答案：/)) {
        if (currentQuestion) {
          currentQuestion.correctAnswer = trimmedLine.replace(/^答案：/, '');
        }
      } else if (trimmedLine.match(/^\d+\. 填空题：/)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          type: 'fill-blank',
          content: trimmedLine.replace(/^\d+\. 填空题：/, ''),
          correctAnswer: ''
        };
      } else if (trimmedLine.match(/^\d+\. 简答题：/)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          type: 'short-answer',
          content: trimmedLine.replace(/^\d+\. 简答题：/, ''),
          correctAnswer: ''
        };
      } else if (currentQuestion && trimmedLine) {
        // 处理多行内容
        if (currentQuestion.type === 'short-answer' && !trimmedLine.match(/^答案：/)) {
          currentQuestion.content += '\n' + trimmedLine;
        }
      }
    }
    
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    
    return questions;
  };
  
  // 提交答案
  const submitAnswers = async () => {
    setAiAssessmentState(prev => ({ ...prev, step: 'analyzing', isAnalyzing: true, error: '' }));
    
    // 进入全屏模式
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
    
    try {
      // 注意：实际项目中，API密钥应该存储在后端，这里为了演示暂时使用
      const API_KEY = '368429e67328449baf850885d696eb85.TR5fxawF9PCyfxMI';
      const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      
      const { questions, userAnswers } = aiAssessmentState;
      
      // 构建API请求参数
      const requestData = {
        model: 'glm-4.7-flash',
        messages: [
          {
            role: 'user',
            content: `请为以下测评题目和用户答案生成详细解析：\n\n${questions.map((q, index) => {
              return `${index + 1}. ${q.type === 'multiple-choice' ? '选择题' : q.type === 'fill-blank' ? '填空题' : '简答题'}\n题目：${q.content}\n${q.type === 'multiple-choice' ? `选项：${q.options.join('\n')}` : ''}\n正确答案：${q.correctAnswer}\n用户答案：${userAnswers[index] || '未作答'}`;
            }).join('\n\n')}`
          }
        ],
        thinking: {
          type: 'enabled'
        },
        max_tokens: 65536,
        temperature: 1.0
      };
      
      // 调用API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestData)
      });
      
      // 检查响应状态
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('API错误:', errorData);
          const errorMessage = errorData.error?.message || errorData.message || `API请求失败`;
          const errorCode = errorData.error?.code || errorData.code || response.status;
          throw new Error(`API错误 [${errorCode}]: ${errorMessage}`);
        } catch (jsonError) {
          console.error('解析错误响应失败:', jsonError);
          throw new Error(`API请求失败 [${response.status}]: ${response.statusText}`);
        }
      }
      
      // 解析响应数据
      const data = await response.json();
      const analysis = data.choices[0]?.message?.content || '';
      
      setAiAssessmentState(prev => ({
        ...prev,
        step: 'result',
        analysis,
        isAnalyzing: false
      }));
    } catch (error) {
      console.error('生成解析失败:', error);
      setAiAssessmentState(prev => ({
        ...prev,
        error: `生成解析失败: ${error.message}`,
        isAnalyzing: false
      }));
    }
  };
  
  // 退出全屏
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setAiAssessmentState(prev => ({ ...prev, step: 'select' }));
  };
  
  // 渲染更新日志页面
  const renderUpdatelogPage = () => {
    const { content, isLoading, error } = updatelogState;
    
    return React.createElement('section', { className: 'ai-chat' }, [
      React.createElement('div', { className: 'ai-chat-container' }, [
        React.createElement('div', { className: 'ai-chat-header' }, '更新日志'),
        React.createElement('div', { style: { padding: '1.75rem' } }, [
          // 加载中状态
          isLoading && React.createElement('div', {
            style: {
              textAlign: 'center',
              padding: '2rem'
            }
          }, [
            React.createElement('div', { className: 'loading' }, [
              '加载更新日志',
              React.createElement('div', { className: 'loading-dots' }, [
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' })
              ])
            ])
          ]),
          
          // 错误状态
          error && React.createElement('div', {
            style: {
              color: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #f44336',
              borderRadius: 'var(--border-radius)',
              padding: '1rem',
              marginBottom: '1.5rem'
            }
          }, error),
          
          // 更新日志内容
          !isLoading && !error && React.createElement('div', {
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: 'var(--border-radius)',
              padding: '2rem',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              color: 'var(--text-color)'
            }
          }, content || '暂无更新日志')
        ])
      ])
    ]);
  };
  
  // 渲染时空页面
  const renderTimeSpacePage = () => {
    const { beijingTime, localTime, isLoading, error } = timeSpaceState;
    const displayTime = localTime || beijingTime;
    
    // 计算钟表指针角度
    const getClockAngles = () => {
      if (!displayTime) return { hour: 0, minute: 0, second: 0 };
      
      const hour = parseInt(displayTime.hour);
      const minute = parseInt(displayTime.minute);
      const second = parseInt(displayTime.second);
      
      return {
        hour: (hour % 12) * 30 + minute * 0.5,
        minute: minute * 6,
        second: second * 6
      };
    };
    
    const angles = getClockAngles();
    
    return React.createElement('section', { className: 'ai-chat' }, [
      React.createElement('div', { className: 'ai-chat-container' }, [
        React.createElement('div', { className: 'ai-chat-header' }, '时空'),
        React.createElement('div', { style: { padding: '1.75rem', textAlign: 'center' } }, [
          // 加载中状态
          isLoading && React.createElement('div', {
            style: {
              textAlign: 'center',
              padding: '4rem'
            }
          }, [
            React.createElement('div', { className: 'loading' }, [
              '加载北京时间',
              React.createElement('div', { className: 'loading-dots' }, [
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' })
              ])
            ])
          ]),
          
          // 错误状态
          error && React.createElement('div', {
            style: {
              color: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #f44336',
              borderRadius: 'var(--border-radius)',
              padding: '1.5rem',
              margin: '2rem 0',
              maxWidth: '500px',
              display: 'inline-block'
            }
          }, [
            React.createElement('p', null, error),
            React.createElement('button', {
              onClick: fetchBeijingTime,
              style: {
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer'
              }
            }, '重试')
          ]),
          
          // 时空内容
          !isLoading && !error && displayTime && React.createElement('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem'
            }
          }, [
            // 数字时间和日期
            React.createElement('div', {
              style: {
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 'var(--border-radius)',
                padding: '2rem',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)'
              }
            }, [
              React.createElement('div', {
                style: {
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: 'var(--text-color)',
                  marginBottom: '0.5rem'
                }
              }, `${displayTime.hour}:${displayTime.minute}:${displayTime.second}`),
              React.createElement('div', {
                style: {
                  fontSize: '1.2rem',
                  color: 'var(--text-secondary-color)'
                }
              }, `${displayTime.year}年${displayTime.month}月${displayTime.day}日 ${displayTime.week}`)
            ]),
            
            // 模拟钟表
            React.createElement('div', {
              style: {
                position: 'relative',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '2px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }
            }, [
              // 钟表刻度
              Array.from({ length: 12 }, (_, i) => {
                const angle = i * 30;
                return React.createElement('div', {
                  key: i,
                  style: {
                    position: 'absolute',
                    width: '4px',
                    height: '15px',
                    backgroundColor: 'var(--text-color)',
                    transformOrigin: 'center center',
                    transform: `rotate(${angle}deg) translateY(-135px)`
                  }
                });
              }),
              
              // 时针
              React.createElement('div', {
                style: {
                  position: 'absolute',
                  width: '6px',
                  height: '80px',
                  backgroundColor: 'var(--text-color)',
                  borderRadius: '3px',
                  transformOrigin: 'bottom center',
                  transform: `translateY(-40px) rotate(${angles.hour}deg)`,
                  zIndex: 1
                }
              }),
              
              // 分针
              React.createElement('div', {
                style: {
                  position: 'absolute',
                  width: '4px',
                  height: '100px',
                  backgroundColor: 'var(--text-color)',
                  borderRadius: '2px',
                  transformOrigin: 'bottom center',
                  transform: `translateY(-50px) rotate(${angles.minute}deg)`,
                  zIndex: 2
                }
              }),
              
              // 秒针
              React.createElement('div', {
                style: {
                  position: 'absolute',
                  width: '2px',
                  height: '110px',
                  backgroundColor: '#f44336',
                  borderRadius: '1px',
                  transformOrigin: 'bottom center',
                  transform: `translateY(-55px) rotate(${angles.second}deg)`,
                  zIndex: 3
                }
              }),
              
              // 中心点
              React.createElement('div', {
                style: {
                  position: 'absolute',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-color)',
                  zIndex: 4
                }
              })
            ]),
            
            // 刷新按钮
            React.createElement('button', {
              onClick: fetchBeijingTime,
              style: {
                padding: '0.75rem 2rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }
            }, '刷新时间'),
            
            // 说明文字
            React.createElement('div', {
              style: {
                fontSize: '0.9rem',
                color: '#666',
                textAlign: 'center',
                margin: '1rem 0',
                maxWidth: '500px'
              }
            }, '时间API服务由UAPIPro提供，该API已连接陕西省西安市阎良区中国科学院国家授时中心，请放心使用')
          ])
        ])
      ])
    ]);
  };
  
  // 渲染AI测评页面
  const renderAiAssessmentPage = () => {
    const { step, selectedStage, selectedDifficulty, selectedSubject, questions, userAnswers, analysis, isGenerating, isAnalyzing, error } = aiAssessmentState;
    
    return React.createElement('section', { className: 'ai-chat' }, [
      React.createElement('div', { className: 'ai-chat-container' }, [
        React.createElement('div', { className: 'ai-chat-header' }, 'AI测评'),
        React.createElement('div', { style: { padding: '1.75rem' } }, [
          // 选择界面
          step === 'select' && React.createElement('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem'
            }
          }, [
            React.createElement('h2', {
              style: {
                color: 'var(--text-color)',
                marginBottom: '1rem'
              }
            }, '开始AI测评'),
            
            // 错误提示
            error && React.createElement('div', {
              style: {
                color: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid #f44336',
                borderRadius: 'var(--border-radius)',
                padding: '1rem',
                marginBottom: '1rem',
                width: '100%',
                maxWidth: '500px'
              }
            }, error),
            
            // 选择器容器
            React.createElement('div', {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                width: '100%',
                maxWidth: '500px'
              }
            }, [
              // 学段选择
              React.createElement('div', {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }
              }, [
                React.createElement('label', {
                  style: {
                    color: 'var(--text-color)',
                    fontWeight: '500'
                  }
                }, '学段'),
                React.createElement('select', {
                  value: selectedStage,
                  onChange: (e) => setAiAssessmentState(prev => ({ ...prev, selectedStage: e.target.value, error: '' })),
                  style: {
                    padding: '0.75rem',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    backgroundColor: 'white'
                  }
                }, [
                  React.createElement('option', { value: '' }, '请选择学段'),
                  React.createElement('option', { value: '小学' }, '小学'),
                  React.createElement('option', { value: '初中' }, '初中'),
                  React.createElement('option', { value: '高中' }, '高中'),
                  React.createElement('option', { value: '大学' }, '大学')
                ])
              ]),
              
              // 难度选择
              React.createElement('div', {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }
              }, [
                React.createElement('label', {
                  style: {
                    color: 'var(--text-color)',
                    fontWeight: '500'
                  }
                }, '难度'),
                React.createElement('select', {
                  value: selectedDifficulty,
                  onChange: (e) => setAiAssessmentState(prev => ({ ...prev, selectedDifficulty: e.target.value, error: '' })),
                  style: {
                    padding: '0.75rem',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    backgroundColor: 'white'
                  }
                }, [
                  React.createElement('option', { value: '' }, '请选择难度'),
                  React.createElement('option', { value: '简单' }, '简单'),
                  React.createElement('option', { value: '中等' }, '中等'),
                  React.createElement('option', { value: '困难' }, '困难')
                ])
              ]),
              
              // 科目选择
              React.createElement('div', {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }
              }, [
                React.createElement('label', {
                  style: {
                    color: 'var(--text-color)',
                    fontWeight: '500'
                  }
                }, '科目'),
                React.createElement('select', {
                  value: selectedSubject,
                  onChange: (e) => setAiAssessmentState(prev => ({ ...prev, selectedSubject: e.target.value, error: '' })),
                  style: {
                    padding: '0.75rem',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    backgroundColor: 'white'
                  }
                }, [
                  React.createElement('option', { value: '' }, '请选择科目'),
                  React.createElement('option', { value: '数学' }, '数学'),
                  React.createElement('option', { value: '语文' }, '语文'),
                  React.createElement('option', { value: '英语' }, '英语'),
                  React.createElement('option', { value: '物理' }, '物理'),
                  React.createElement('option', { value: '化学' }, '化学'),
                  React.createElement('option', { value: '生物' }, '生物')
                ])
              ])
            ]),
            
            // 生成题目按钮
            React.createElement('button', {
              onClick: generateQuestions,
              disabled: !selectedStage || !selectedDifficulty || !selectedSubject,
              style: {
                padding: '1rem 3rem',
                backgroundColor: !selectedStage || !selectedDifficulty || !selectedSubject ? '#ccc' : 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '1.1rem',
                fontWeight: '500',
                cursor: !selectedStage || !selectedDifficulty || !selectedSubject ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)',
                marginTop: '1rem'
              }
            }, '生成题目')
          ]),
          
          // 生成题目加载状态
          step === 'generating' && isGenerating && React.createElement('div', {
            style: {
              textAlign: 'center',
              padding: '4rem'
            }
          }, [
            React.createElement('div', { className: 'loading' }, [
              '生成题目中',
              React.createElement('div', { className: 'loading-dots' }, [
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' })
              ])
            ])
          ]),
          
          // 答题界面
          step === 'answering' && React.createElement('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }
          }, [
            React.createElement('h2', {
              style: {
                color: 'var(--text-color)',
                marginBottom: '1rem'
              }
            }, '答题'),
            
            // 错误提示
            error && React.createElement('div', {
              style: {
                color: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid #f44336',
                borderRadius: 'var(--border-radius)',
                padding: '1rem',
                marginBottom: '1rem'
              }
            }, error),
            
            // 题目列表
            React.createElement('div', {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              }
            }, questions.map((question, index) => {
              return React.createElement('div', {
                key: index,
                style: {
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: 'var(--border-radius)',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)'
                }
              }, [
                React.createElement('h3', {
                  style: {
                    color: 'var(--text-color)',
                    marginBottom: '1rem'
                  }
                }, `${index + 1}. ${question.type === 'multiple-choice' ? '选择题' : question.type === 'fill-blank' ? '填空题' : '简答题'}`),
                React.createElement('p', {
                  style: {
                    color: 'var(--text-color)',
                    marginBottom: '1.5rem',
                    whiteSpace: 'pre-wrap'
                  }
                }, question.content),
                
                // 选择题选项
                question.type === 'multiple-choice' && React.createElement('div', {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }
                }, question.options.map((option, optIndex) => {
                  return React.createElement('div', {
                    key: optIndex,
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }
                  }, [
                    React.createElement('input', {
                      type: 'radio',
                      name: `question-${index}`,
                      value: option.split('. ')[0],
                      checked: userAnswers[index] === option.split('. ')[0],
                      onChange: (e) => setAiAssessmentState(prev => ({
                        ...prev,
                        userAnswers: {
                          ...prev.userAnswers,
                          [index]: e.target.value
                        }
                      })),
                      style: {
                        cursor: 'pointer'
                      }
                    }),
                    React.createElement('label', {
                      style: {
                        color: 'var(--text-color)',
                        cursor: 'pointer'
                      }
                    }, option)
                  ]);
                })),
                
                // 填空题输入
                question.type === 'fill-blank' && React.createElement('input', {
                  type: 'text',
                  value: userAnswers[index] || '',
                  onChange: (e) => setAiAssessmentState(prev => ({
                    ...prev,
                    userAnswers: {
                      ...prev.userAnswers,
                      [index]: e.target.value
                    }
                  })),
                  style: {
                    padding: '0.75rem',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    width: '100%',
                    marginBottom: '1rem'
                  },
                  placeholder: '请输入答案'
                }),
                
                // 简答题输入
                question.type === 'short-answer' && React.createElement('textarea', {
                  value: userAnswers[index] || '',
                  onChange: (e) => setAiAssessmentState(prev => ({
                    ...prev,
                    userAnswers: {
                      ...prev.userAnswers,
                      [index]: e.target.value
                    }
                  })),
                  style: {
                    padding: '0.75rem',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    width: '100%',
                    height: '150px',
                    resize: 'vertical',
                    marginBottom: '1rem'
                  },
                  placeholder: '请输入答案'
                })
              ]);
            })),
            
            // 提交答案按钮
            React.createElement('button', {
              onClick: submitAnswers,
              style: {
                padding: '1rem 3rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '1.1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'var(--transition)',
                alignSelf: 'center',
                marginTop: '1rem'
              }
            }, '提交答案')
          ]),
          
          // 生成解析加载状态
          step === 'analyzing' && isAnalyzing && React.createElement('div', {
            style: {
              textAlign: 'center',
              padding: '4rem'
            }
          }, [
            React.createElement('div', { className: 'loading' }, [
              '生成解析中',
              React.createElement('div', { className: 'loading-dots' }, [
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' })
              ])
            ])
          ]),
          
          // 解析结果界面
          step === 'result' && React.createElement('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }
          }, [
            React.createElement('h2', {
              style: {
                color: 'var(--text-color)',
                marginBottom: '1rem'
              }
            }, '测评解析'),
            
            // 错误提示
            error && React.createElement('div', {
              style: {
                color: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid #f44336',
                borderRadius: 'var(--border-radius)',
                padding: '1rem',
                marginBottom: '1rem'
              }
            }, error),
            
            // 解析内容
            React.createElement('div', {
              style: {
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 'var(--border-radius)',
                padding: '2rem',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                color: 'var(--text-color)',
                maxHeight: '60vh',
                overflow: 'auto'
              }
            }, analysis),
            
            // 退出全屏按钮
            React.createElement('button', {
              onClick: exitFullscreen,
              style: {
                padding: '1rem 3rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '1.1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'var(--transition)',
                alignSelf: 'center',
                marginTop: '1rem'
              }
            }, '退出全屏')
          ])
        ])
      ])
    ]);
  };

  return React.createElement('div', { className: 'app' }, [
    // 导航栏
    React.createElement('nav', { className: 'navbar' }, [
      React.createElement('button', {
        className: 'navbar-logo',
        onClick: () => handleNavClick('home')
      }, [
        React.createElement('img', { src: 'https://cdn.luogu.com.cn/upload/image_hosting/jsowe5y1.png', alt: '辰光未来星', className: 'logo-image' })
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
        }, '工单反馈')),
        React.createElement('li', null, React.createElement('button', {
          className: currentPage === 'updatelog' ? 'nav-active' : '',
          onClick: () => handleNavClick('updatelog')
        }, '更新日志'))
      ]),
      React.createElement('div', {
        style: {
          display: 'flex',
          gap: '1rem'
        }
      }, [
        currentUser ? (
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }
        }, [
          React.createElement('span', {
            style: {
              color: 'var(--text-color)',
              fontWeight: '500'
            }
          }, `欢迎, ${currentUser.username}`),
          React.createElement('button', {
            className: 'navbar-btn',
            onClick: () => {
              setCurrentUser(null);
              localStorage.removeItem('currentUser');
            }
          }, '退出')
        ])
      ) : [
        React.createElement('button', {
          className: 'navbar-btn',
          onClick: () => setAuthDialogState(prev => ({ ...prev, show: true, mode: 'login', error: '', success: '' }))
        }, '登录'),
        React.createElement('button', {
          className: 'navbar-btn',
          onClick: () => setAuthDialogState(prev => ({ ...prev, show: true, mode: 'register', error: '', success: '' }))
        }, '注册')
      ]
      ])
    ]),

    // 页面内容
    currentPage === 'home' && renderHomePage(handleNavClick),
    currentPage === 'features' && renderFeaturesPage(handleNavClick),
    currentPage === 'chat' && renderChatPage(messages, inputValue, isLoading, setInputValue, handleSendMessage, handleKeyPress, messagesEndRef),
    currentPage === 'draw' && renderDrawPage(drawPrompt, drawImage, isDrawing, drawError, setDrawPrompt, handleDrawImage),
    currentPage === 'correction' && renderCorrectionPage(correctionState, setCorrectionState, handleImageUpload, handleCorrection, resetCorrectionState),
    currentPage === 'study-plan' && renderStudyPlanPage(studyPlanState, setStudyPlanState, handleGenerateStudyPlan, handleInputChange, resetStudyPlanState),
    currentPage === 'morning-reading' && renderMorningReadingPage(),
    currentPage === 'updatelog' && renderUpdatelogPage(),
    currentPage === 'time-space' && renderTimeSpacePage(),
    currentPage === 'ai-assessment' && renderAiAssessmentPage(),
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
          src: 'https://cdn.luogu.com.cn/upload/image_hosting/uwlfzczt.png',
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
        }, '"辰光未来星"已被作者永久托管至GitHub，请放心使用（网站版本：10.0.0.267B 更新日期：2026年2月27日）')
      ])
    ]),
    
    // 登录/注册对话框
    authDialogState.show && React.createElement('div', {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }
    }, [
      React.createElement('div', {
        style: {
          backgroundColor: 'white',
          borderRadius: 'var(--border-radius)',
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          boxShadow: 'var(--shadow-xl)'
        }
      }, [
        // 标题
        React.createElement('h3', {
          style: {
            fontFamily: '"微软雅黑", sans-serif',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }
        }, authDialogState.mode === 'login' ? '用户登录' : '用户注册'),
        
        // 错误提示
        authDialogState.error && React.createElement('div', {
          style: {
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            color: '#f44336',
            padding: '0.75rem',
            borderRadius: 'var(--border-radius)',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }
        }, authDialogState.error),
        
        // 成功提示
        authDialogState.success && React.createElement('div', {
          style: {
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            color: '#4caf50',
            padding: '0.75rem',
            borderRadius: 'var(--border-radius)',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }
        }, authDialogState.success),
        
        // 用户名输入
        React.createElement('div', {
          style: {
            marginBottom: '1rem'
          }
        }, [
          React.createElement('label', {
            style: {
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-color)',
              fontWeight: '500'
            }
          }, '用户名'),
          React.createElement('input', {
            type: 'text',
            value: authDialogState.username,
            onChange: (e) => setAuthDialogState(prev => ({ ...prev, username: e.target.value })),
            placeholder: '请输入用户名',
            style: {
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e0e0e0',
              borderRadius: 'var(--border-radius)',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }
          })
        ]),
        
        // 密码输入
        React.createElement('div', {
          style: {
            marginBottom: authDialogState.mode === 'register' ? '1rem' : '1.5rem'
          }
        }, [
          React.createElement('label', {
            style: {
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-color)',
              fontWeight: '500'
            }
          }, '密码'),
          React.createElement('input', {
            type: 'password',
            value: authDialogState.password,
            onChange: (e) => setAuthDialogState(prev => ({ ...prev, password: e.target.value })),
            placeholder: '请输入密码',
            style: {
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e0e0e0',
              borderRadius: 'var(--border-radius)',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }
          })
        ]),
        
        // 确认密码（仅注册时显示）
        authDialogState.mode === 'register' && React.createElement('div', {
          style: {
            marginBottom: '1.5rem'
          }
        }, [
          React.createElement('label', {
            style: {
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-color)',
              fontWeight: '500'
            }
          }, '确认密码'),
          React.createElement('input', {
            type: 'password',
            value: authDialogState.confirmPassword,
            onChange: (e) => setAuthDialogState(prev => ({ ...prev, confirmPassword: e.target.value })),
            placeholder: '请再次输入密码',
            style: {
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e0e0e0',
              borderRadius: 'var(--border-radius)',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }
          })
        ]),
        
        // 按钮组
        React.createElement('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }
        }, [
          // 提交按钮
          React.createElement('button', {
            onClick: () => handleAuthSubmit(),
            disabled: authDialogState.isLoading,
            style: {
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: authDialogState.isLoading ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)',
              opacity: authDialogState.isLoading ? '0.7' : '1'
            }
          }, authDialogState.isLoading 
            ? (authDialogState.mode === 'login' ? '登录中...' : '注册中...') 
            : (authDialogState.mode === 'login' ? '登录' : '注册')),
          
          // 切换模式按钮
          React.createElement('button', {
            onClick: () => setAuthDialogState(prev => ({ 
              ...prev, 
              mode: prev.mode === 'login' ? 'register' : 'login',
              error: '',
              success: ''
            })),
            style: {
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: 'var(--primary-color)',
              border: '1px solid var(--primary-color)',
              borderRadius: 'var(--border-radius)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }
          }, authDialogState.mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'),
          
          // 关闭按钮
          React.createElement('button', {
            onClick: () => setAuthDialogState(prev => ({ 
              ...prev, 
              show: false, 
              error: '', 
              success: '',
              username: '',
              password: '',
              confirmPassword: ''
            })),
            style: {
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f5f5f5',
              color: 'var(--text-color)',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }
          }, '取消')
        ]),
        
        // 服务提供方信息
        React.createElement('div', {
          style: {
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#666'
          }
        }, [
          React.createElement('img', {
            src: 'https://cdn.luogu.com.cn/upload/image_hosting/kd0w2529.png',
            alt: 'Supabase Logo',
            style: {
              width: '48px',
              height: '48px',
              marginBottom: '0.5rem',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto'
            }
          }),
          React.createElement('p', {
            style: {
              margin: '0'
            }
          }, '账户服务提供方：Supabase')
        ])
      ])
    ]),
    
    // 每日新闻弹窗
    newsDialogState.show && React.createElement('div', {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001, // 比其他弹窗层级高
        padding: '1rem'
      }
    }, [
      React.createElement('div', {
        style: {
          backgroundColor: 'white',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow-xl)',
          maxWidth: '95vw',
          width: '100%',
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }, [
        // 弹窗头部
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            borderTopLeftRadius: 'var(--border-radius)',
            borderTopRightRadius: 'var(--border-radius)'
          }
        }, [
          React.createElement('h3', {
            style: {
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }
          }, '每日新闻摘要'),
          React.createElement('button', {
            onClick: () => setNewsDialogState(prev => ({ ...prev, show: false })),
            style: {
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }, '×')
        ]),

        
        // 弹窗内容 - 可滚动区域
        React.createElement('div', {
          style: {
            flex: 1,
            padding: '1rem',
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }
        }, [
          // 加载中状态
          newsDialogState.isLoading && React.createElement('div', {
            style: {
              padding: '4rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }
          }, [
            React.createElement('div', { className: 'loading' }, [
              '加载每日新闻',
              React.createElement('div', { className: 'loading-dots' }, [
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' })
              ])
            ])
          ]),
          
          // 错误状态
          newsDialogState.error && React.createElement('div', {
            style: {
              color: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #f44336',
              borderRadius: 'var(--border-radius)',
              padding: '1.5rem',
              margin: '2rem 0',
              maxWidth: '500px'
            }
          }, [
            React.createElement('p', null, newsDialogState.error),
            React.createElement('button', {
              onClick: fetchDailyNewsImage,
              style: {
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer'
              }
            }, '重试')
          ]),
          
          // 新闻图片
          !newsDialogState.isLoading && !newsDialogState.error && newsDialogState.imageUrl && React.createElement('div', {
            style: {
              margin: '1rem 0',
              display: 'inline-block'
            }
          }, [
            React.createElement('img', {
              src: newsDialogState.imageUrl,
              alt: '每日新闻摘要',
              style: {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow-md)'
              }
            })
          ])
        ]),
        
        // 弹窗底部
        React.createElement('div', {
          style: {
            padding: '1rem',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center'
          }
        }, [
          React.createElement('button', {
            onClick: () => setNewsDialogState(prev => ({ ...prev, show: false })),
            style: {
              padding: '0.75rem 2rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }
          }, '关闭')
        ])
      ])
    ])
  ]);
}

// 渲染应用
ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null, React.createElement(App))
);