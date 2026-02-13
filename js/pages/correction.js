// AI批改页面渲染函数
function renderCorrectionPage(correctionState, setCorrectionState, handleImageUpload, handleOCRScan, confirmOCRResult, handleCorrection, resetCorrectionState) {
  const { 
    image, 
    isUploading, 
    uploadError, 
    isCorrecting, 
    correctionResults, 
    correctionError 
  } = correctionState;

  return React.createElement('section', { className: 'ai-chat' }, [
    React.createElement('div', { className: 'ai-chat-container' }, [
      React.createElement('div', { className: 'ai-chat-header' }, 'AI批改'),
      
      // 图片上传区域
      !image ? (
        React.createElement('div', { style: { padding: '1.75rem' } }, [
          // 错误提示
          uploadError && React.createElement('div', {
            style: {
              color: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #f44336',
              borderRadius: 'var(--border-radius)',
              padding: '1rem',
              marginBottom: '1.5rem'
            }
          }, uploadError),
          
          // 上传提示
          React.createElement('div', {
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: 'var(--border-radius)',
              padding: '3rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }
          }, [
            React.createElement('div', {
              style: {
                fontSize: '4rem',
                marginBottom: '1.5rem'
              }
            }, '📷'),
            React.createElement('h3', {
              style: {
                color: 'var(--text-color)',
                marginBottom: '1rem'
              }
            }, '上传图片'),
            React.createElement('p', {
              style: {
                color: 'var(--text-secondary-color)',
                marginBottom: '2rem'
              }
            }, '请上传作业或试卷的图片，AI将自动识别并批改'),
            
            // 上传按钮
            React.createElement('div', {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'center'
              }
            }, [
              React.createElement('label', {
                style: {
                  padding: '1rem 2rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                },
                htmlFor: 'image-upload'
              }, '选择图片'),
              React.createElement('input', {
                type: 'file',
                id: 'image-upload',
                accept: 'image/*',
                capture: 'camera',
                onChange: handleImageUpload,
                style: {
                  display: 'none'
                }
              }),
              React.createElement('p', {
                style: {
                  color: 'var(--text-secondary-color)',
                  fontSize: '0.9rem'
                }
              }, '支持 JPG、PNG 格式，最大 10MB')
            ])
          ])
        ])
      ) : (
        // 处理中或结果展示区域
        React.createElement('div', { style: { padding: '1.75rem' } }, [
          // 上传的图片预览
          React.createElement('div', {
            style: {
              textAlign: 'center',
              marginBottom: '1.5rem'
            }
          }, [
            React.createElement('img', {
              src: image,
              alt: '上传的图片',
              style: {
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow-md)'
              }
            })
          ]),
          

          
          // 批改中
          isCorrecting && React.createElement('div', {
            style: {
              backgroundColor: 'rgba(0, 120, 212, 0.1)',
              border: '1px solid var(--primary-color)',
              borderRadius: 'var(--border-radius)',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }
          }, [
            React.createElement('div', { className: 'loading' }, [
              '正在进行AI批改',
              React.createElement('div', { className: 'loading-dots' }, [
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' })
              ])
            ]),
            React.createElement('p', {
              style: {
                color: 'var(--text-secondary-color)',
                marginTop: '1rem'
              }
            }, 'AI正在分析题目，请耐心等待...')
          ]),
          
          // 批改错误
          correctionError && React.createElement('div', {
            style: {
              color: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #f44336',
              borderRadius: 'var(--border-radius)',
              padding: '1rem',
              marginBottom: '1.5rem'
            }
          }, correctionError),
          
          // 批改结果
          correctionResults.length > 0 && React.createElement('div', {
            style: {
              marginBottom: '1.5rem'
            }
          }, [
            React.createElement('h3', {
              style: {
                color: 'var(--text-color)',
                marginBottom: '1.5rem'
              }
            }, '批改结果'),
            ...correctionResults.map((result, index) => (
              React.createElement('div', {
                key: index,
                style: {
                  backgroundColor: result.isFullScore ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                  border: `1px solid ${result.isFullScore ? '#4CAF50' : '#ffa500'}`,
                  borderRadius: 'var(--border-radius)',
                  padding: '1.5rem',
                  marginBottom: '1rem'
                }
              }, [
                React.createElement('h4', {
                  style: {
                    color: result.isFullScore ? '#4CAF50' : '#ffa500',
                    marginBottom: '0.75rem'
                  }
                }, `题目 ${result.questionId}: ${result.isFullScore ? '满分' : '不满分'}`),
                React.createElement('div', {
                  style: {
                    color: 'var(--text-color)',
                    marginBottom: '1rem',
                    fontSize: '0.95rem'
                  }
                }, result.questionContent),
                !result.isFullScore && result.explanation && React.createElement('div', {
                  style: {
                    color: 'var(--text-secondary-color)',
                    fontSize: '0.9rem',
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    padding: '1rem',
                    borderRadius: 'var(--border-radius)'
                  }
                }, [
                  React.createElement('strong', null, '错误解释：'),
                  React.createElement('br'),
                  result.explanation
                ])
              ])
            )),
            
            // 重新批改按钮
            React.createElement('button', {
              onClick: resetCorrectionState,
              style: {
                width: '100%',
                padding: '0.875rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '1.5rem'
              }
            }, '重新批改')
          ])
        ])
      )
    ])
  ]);
}
