// AI出题测评页面渲染函数
function renderAssessmentPage(assessmentState, setAssessmentState, handleGenerateQuestions, handleSubmitAnswer, handleNextQuestion, openAskModal, closeAskModal, handleAskQuestion, isAsking, askMessages, askInput, askMessagesEndRef) {
  const { 
    selectedGrade, 
    selectedSubject, 
    selectedDifficulty, 
    questions, 
    currentQuestionIndex, 
    userAnswers, 
    isLoading, 
    error, 
    showExplanation, 
    explanation, 
    showAskModal,
    isCorrect
  } = assessmentState;

  const currentQuestion = questions[currentQuestionIndex];
  const hasQuestions = questions.length > 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // 学段选项
  const grades = ['小学', '初中', '高中'];
  // 学科选项
  const subjects = ['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
  // 难度选项
  const difficulties = ['简单', '中等', '困难'];

  return React.createElement('section', { className: 'ai-chat' }, [
    React.createElement('div', { className: 'ai-chat-container' }, [
      React.createElement('div', { className: 'ai-chat-header' }, 'AI出题测评'),
      
      // 配置区域
      !hasQuestions ? (
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
          
          // 选择表单
          React.createElement('div', {
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.95))',
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
            }, '选择测评配置'),
            
            // 学段选择
            React.createElement('div', {
              style: {
                marginBottom: '1.5rem'
              }
            }, [
              React.createElement('label', {
                style: {
                  display: 'block',
                  color: 'var(--text-color)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }
              }, '学段'),
              React.createElement('select', {
                value: selectedGrade,
                onChange: (e) => setAssessmentState(prev => ({ ...prev, selectedGrade: e.target.value })),
                style: {
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: 'var(--background-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--text-color)',
                  fontSize: '1rem'
                }
              }, [
                React.createElement('option', { value: '' }, '请选择学段'),
                ...grades.map(grade => React.createElement('option', { key: grade, value: grade }, grade))
              ])
            ]),
            
            // 学科选择
            React.createElement('div', {
              style: {
                marginBottom: '1.5rem'
              }
            }, [
              React.createElement('label', {
                style: {
                  display: 'block',
                  color: 'var(--text-color)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }
              }, '学科'),
              React.createElement('select', {
                value: selectedSubject,
                onChange: (e) => setAssessmentState(prev => ({ ...prev, selectedSubject: e.target.value })),
                style: {
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: 'var(--background-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--text-color)',
                  fontSize: '1rem'
                }
              }, [
                React.createElement('option', { value: '' }, '请选择学科'),
                ...subjects.map(subject => React.createElement('option', { key: subject, value: subject }, subject))
              ])
            ]),
            
            // 难度选择
            React.createElement('div', {
              style: {
                marginBottom: '2rem'
              }
            }, [
              React.createElement('label', {
                style: {
                  display: 'block',
                  color: 'var(--text-color)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }
              }, '难度'),
              React.createElement('select', {
                value: selectedDifficulty,
                onChange: (e) => setAssessmentState(prev => ({ ...prev, selectedDifficulty: e.target.value })),
                style: {
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: 'var(--background-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--text-color)',
                  fontSize: '1rem'
                }
              }, [
                React.createElement('option', { value: '' }, '请选择难度'),
                ...difficulties.map(difficulty => React.createElement('option', { key: difficulty, value: difficulty }, difficulty))
              ])
            ]),
            
            // 生成题目按钮
            React.createElement('button', {
              onClick: handleGenerateQuestions,
              disabled: isLoading,
              style: {
                width: '100%',
                padding: '0.875rem',
                backgroundColor: 'var(--primary-color)',
                backgroundImage: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition)'
              }
            }, isLoading ? '生成题目中...' : '生成题目')
          ])
        ])
      ) : (
        // 题目展示区域
        React.createElement('div', { style: { padding: '1.75rem' } }, [
          // 题目导航
          React.createElement('div', {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }
          }, [
            React.createElement('h3', {
              style: {
                color: 'var(--text-color)',
                margin: 0
              }
            }, `题目 ${currentQuestionIndex + 1}/${questions.length}`),
            React.createElement('div', {
              style: {
                display: 'flex',
                gap: '0.5rem'
              }
            }, [
              ...questions.map((q, index) => (
                React.createElement('button', {
                  key: q.id,
                  onClick: () => setAssessmentState(prev => ({ ...prev, currentQuestionIndex: index })),
                  style: {
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    backgroundColor: index === currentQuestionIndex ? 'var(--primary-color)' : 'var(--surface-color)',
                    color: index === currentQuestionIndex ? 'white' : 'var(--text-color)',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }
                }, q.id)
              ))
            ])
          ]),
          
          // 题目内容
          currentQuestion && React.createElement('div', {
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.95))',
              borderRadius: 'var(--border-radius)',
              padding: '2rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)'
            }
          }, [
            React.createElement('div', {
              style: {
                color: 'var(--text-color)',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }
            }, currentQuestion.content),
            
            // 选项（如果有）
            currentQuestion.options && React.createElement('div', {
              style: {
                marginBottom: '1.5rem'
              }
            }, currentQuestion.options.map((option, index) => (
              React.createElement('div', {
                key: index,
                style: {
                  marginBottom: '0.75rem'
                }
              }, [
                React.createElement('label', {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-secondary-color)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: 'var(--border-radius)',
                    transition: 'background-color 0.2s ease-in-out'
                  },
                  onClick: () => {
                    const selectedOption = String.fromCharCode(65 + index);
                    setAssessmentState(prev => {
                      const updatedAnswers = [...prev.userAnswers];
                      updatedAnswers[currentQuestionIndex] = selectedOption;
                      return { ...prev, userAnswers: updatedAnswers };
                    });
                  }
                }, [
                  React.createElement('input', {
                    type: 'radio',
                    name: 'answer',
                    value: String.fromCharCode(65 + index),
                    checked: userAnswers[currentQuestionIndex] === String.fromCharCode(65 + index),
                    readOnly: true,
                    style: {
                      accentColor: 'var(--primary-color)',
                      cursor: 'pointer'
                    }
                  }),
                  React.createElement('span', null, `${String.fromCharCode(65 + index)}. ${option}`)
                ])
              ])
            ))),
            
            // 填空题答案输入
            !currentQuestion.options && React.createElement('div', {
              style: {
                marginBottom: '1.5rem'
              }
            }, [
              React.createElement('label', {
                style: {
                  display: 'block',
                  color: 'var(--text-color)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }
              }, '答案'),
              React.createElement('input', {
                type: 'text',
                value: userAnswers[currentQuestionIndex] || '',
                onChange: (e) => setAssessmentState(prev => {
                  const updatedAnswers = [...prev.userAnswers];
                  updatedAnswers[currentQuestionIndex] = e.target.value;
                  return { ...prev, userAnswers: updatedAnswers };
                }),
                style: {
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: 'var(--background-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--text-color)',
                  fontSize: '1rem'
                }
              })
            ]),
            
            // 提交答案按钮
            !userAnswers[currentQuestionIndex] && React.createElement('button', {
              onClick: () => handleSubmitAnswer(userAnswers[currentQuestionIndex] || ''),
              disabled: !userAnswers[currentQuestionIndex],
              style: {
                padding: '0.875rem 1.75rem',
                backgroundColor: 'var(--primary-color)',
                backgroundImage: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: !userAnswers[currentQuestionIndex] ? 'not-allowed' : 'pointer',
                opacity: !userAnswers[currentQuestionIndex] ? 0.7 : 1,
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition)'
              }
            }, '提交答案')
          ]),
          
          // 解析区域
          showExplanation && React.createElement('div', {
            style: {
              backgroundColor: isCorrect ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)',
              border: `1px solid ${isCorrect ? '#4CAF50' : '#ffa500'}`,
              borderRadius: 'var(--border-radius)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }
          }, [
            React.createElement('h4', {
              style: {
                color: isCorrect ? '#4CAF50' : '#ffa500',
                marginBottom: '1rem'
              }
            }, isCorrect ? '回答正确！' : '回答错误！'),
            React.createElement('h5', {
              style: {
                color: 'var(--text-color)',
                marginBottom: '1rem'
              }
            }, '题目解析'),
            React.createElement('div', {
              style: {
                color: 'var(--text-secondary-color)',
                lineHeight: '1.6'
              }
            }, explanation)
          ]),
          
          // 正确答案提示
          showExplanation && !isCorrect && React.createElement('div', {
            style: {
              backgroundColor: 'rgba(255, 165, 0, 0.1)',
              border: '1px solid #ffa500',
              borderRadius: 'var(--border-radius)',
              padding: '1rem',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }
          }, [
            React.createElement('p', {
              style: {
                color: '#ffa500',
                margin: 0
              }
            }, `正确答案：${currentQuestion.correctAnswer}`)
          ]),
          
          // 提交答案按钮
            !userAnswers[currentQuestionIndex] && React.createElement('button', {
              onClick: () => handleSubmitAnswer(userAnswers[currentQuestionIndex] || ''),
              disabled: !userAnswers[currentQuestionIndex],
              style: {
                padding: '0.875rem 1.75rem',
                backgroundColor: 'var(--primary-color)',
                backgroundImage: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: !userAnswers[currentQuestionIndex] ? 'not-allowed' : 'pointer',
                opacity: !userAnswers[currentQuestionIndex] ? 0.7 : 1,
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition)'
              }
            }, '提交答案'),
          
            // 操作按钮
          userAnswers[currentQuestionIndex] && React.createElement('div', {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem'
            }
          }, [
            React.createElement('button', {
              onClick: openAskModal,
              style: {
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--surface-color)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }
            }, '追问'),
            React.createElement('button', {
              onClick: handleNextQuestion,
              disabled: isLastQuestion,
              style: {
                padding: '0.75rem 1.5rem',
                backgroundColor: isLastQuestion ? 'var(--border-color)' : 'var(--primary-color)',
                backgroundImage: isLastQuestion ? 'none' : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: isLastQuestion ? 'not-allowed' : 'pointer',
                opacity: isLastQuestion ? 0.7 : 1,
                flex: 1,
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition)'
              }
            }, isLastQuestion ? '测评完成' : '下一题')
          ])
        ])
      )
    ]),
    
    // 追问模态框
    showAskModal && React.createElement('div', {
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
        zIndex: 1000
      }
    }, [
      React.createElement('div', {
        style: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--border-radius)',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)'
        }
      }, [
        // 模态框头部
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--primary-color)',
            backgroundImage: 'linear-gradient(to right, #0078d4, #005a9e)',
            color: 'white',
            borderTopLeftRadius: 'var(--border-radius)',
            borderTopRightRadius: 'var(--border-radius)'
          }
        }, [
          React.createElement('h3', {
            style: {
              margin: 0,
              fontSize: '1.25rem'
            }
          }, 'AI辅导老师'),
          React.createElement('button', {
              onClick: closeAskModal,
              style: {
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: 0,
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition)'
              }
            }, '×')
        ]),
        
        // 模态框内容
        React.createElement('div', {
          style: {
            padding: '1.5rem',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }
        }, [
          ...askMessages.map((msg, index) => (
            React.createElement('div', {
              key: index,
              style: {
                alignSelf: msg.role === 'user' || msg.role === 'assistant' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '1rem',
                borderRadius: 'var(--border-radius)',
                backgroundColor: msg.role === 'user' ? 'var(--primary-color)' : 'var(--surface-hover-color)',
                color: msg.role === 'user' ? 'white' : 'var(--text-color)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition)'
              }
            }, msg.content)
          )),
          // 加载动画
          isAsking && React.createElement('div', {
            style: {
              alignSelf: 'flex-start',
              maxWidth: '80%',
              padding: '1rem',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--surface-hover-color)',
              color: 'var(--text-color)',
              boxShadow: 'var(--shadow-sm)'
            }
          }, [
            React.createElement('div', { className: 'loading' }, [
              'AI正在思考',
              React.createElement('div', { className: 'loading-dots' }, [
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' }),
                React.createElement('div', { className: 'loading-dot' })
              ])
            ])
          ]),
          React.createElement('div', { ref: askMessagesEndRef })
        ]),
        
        // 模态框输入
        React.createElement('div', {
          style: {
            padding: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.75rem',
            backgroundColor: 'var(--surface-color)'
          }
        }, [
          React.createElement('input', {
            type: 'text',
            value: askInput,
            onChange: (e) => setAssessmentState(prev => ({ ...prev, askInput: e.target.value })),
            onKeyPress: (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAskQuestion();
              }
            },
            placeholder: '输入你的问题...',
            disabled: isAsking,
            style: {
              flex: 1,
              padding: '0.75rem',
              backgroundColor: 'var(--background-color)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              color: 'var(--text-color)',
              fontSize: '1rem',
              transition: 'var(--transition)'
            }
          }),
          React.createElement('button', {
            onClick: handleAskQuestion,
            disabled: isAsking || !askInput.trim(),
            style: {
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary-color)',
              backgroundImage: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isAsking ? 'not-allowed' : 'pointer',
              opacity: isAsking || !askInput.trim() ? 0.7 : 1,
              boxShadow: 'var(--shadow-sm)',
              transition: 'var(--transition)'
            }
          }, isAsking ? '发送中...' : '发送')
        ])
      ])
    ])
  ]);
}
