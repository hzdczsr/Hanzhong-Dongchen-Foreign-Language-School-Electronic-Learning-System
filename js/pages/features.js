// 功能页面渲染函数
const renderFeaturesPage = (handleNavClick) => {
  return React.createElement('div', { className: 'features-page' }, [
    React.createElement('div', { className: 'features-page-header' }, [
      React.createElement('h1', null, '强大功能，智能学习'),
      React.createElement('p', null, '辰光未来星提供多种AI驱动的学习工具，满足您的各种学习需求，让学习变得更加高效、有趣。')
    ]),
    
    // AI 工具分类
    React.createElement('div', { className: 'features-category' }, [
      React.createElement('h2', null, '🤖 AI 智能工具'),
      React.createElement('div', { className: 'features-list' }, [
        // AI对话功能
        React.createElement('div', { className: 'feature-item' }, [
          React.createElement('div', { className: 'feature-item-icon' }, '💬'),
          React.createElement('h3', null, 'AI智能对话'),
          React.createElement('p', null, '与AI进行实时对话，获取专业的学习解答，解决您在学习过程中遇到的各种问题。'),
          React.createElement('button', {
            className: 'feature-item-btn',
            onClick: () => {
              handleNavClick('chat');
            }
          }, '开始对话')
        ]),
        
        // AI绘画功能
        React.createElement('div', { className: 'feature-item' }, [
          React.createElement('div', { className: 'feature-item-icon' }, '🎨'),
          React.createElement('h3', null, 'AI绘画'),
          React.createElement('p', null, '使用先进的AI绘画技术，将您的创意变为现实，为学习添加更多视觉元素。'),
          React.createElement('button', {
            className: 'feature-item-btn',
            onClick: () => handleNavClick('draw')
          }, '立即创作')
        ]),
        

      ])
    ]),
    
    // 学习工具分类
    React.createElement('div', { className: 'features-category' }, [
      React.createElement('h2', null, '📚 学习辅助工具'),
      React.createElement('div', { className: 'features-list' }, [
        // AI批改功能
        React.createElement('div', { className: 'feature-item' }, [
          React.createElement('div', { className: 'feature-item-icon' }, '✨'),
          React.createElement('h3', null, 'AI批改'),
          React.createElement('p', null, '快速批改作业和试卷，提供详细的分析和建议，帮助您提高学习效率。'),
          React.createElement('button', {
            className: 'feature-item-btn',
            onClick: () => handleNavClick('correction')
          }, '立即批改')
        ]),
        
        // 知识图谱功能
        React.createElement('div', { className: 'feature-item' }, [
          React.createElement('div', { className: 'feature-item-icon' }, '🔗'),
          React.createElement('h3', null, '知识图谱'),
          React.createElement('p', null, '可视化展示知识点之间的关联，帮助您构建完整的知识体系。'),
          React.createElement('button', {
            className: 'feature-item-btn'
          }, '探索图谱')
        ]),
        
        // 学习计划功能
        React.createElement('div', { className: 'feature-item' }, [
          React.createElement('div', { className: 'feature-item-icon' }, '📅'),
          React.createElement('h3', null, '学习计划'),
          React.createElement('p', null, '智能制定个性化学习计划，根据您的学习目标和时间安排，优化学习路径。'),
          React.createElement('button', {
            className: 'feature-item-btn',
            onClick: () => handleNavClick('study-plan')
          }, '制定计划')
        ])
      ])
    ])
  ]);
};
