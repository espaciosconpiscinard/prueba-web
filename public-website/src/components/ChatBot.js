import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaComment, FaTimes, FaPaperPlane } from 'react-icons/fa';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isOpen && questions.length === 0) {
      fetchQuestions();
    }
  }, [isOpen]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/cms/chatbot/questions`);
      if (response.data && response.data.length > 0) {
        setQuestions(response.data);
        setMessages([
          {
            type: 'bot',
            text: '¡Hola! Soy tu asistente virtual. Te haré algunas preguntas para ayudarte mejor. 😊'
          },
          {
            type: 'bot',
            text: response.data[0].question_text
          }
        ]);
      } else {
        // Default questions if none configured
        const defaultQuestions = [
          { id: '1', question_text: '¿Cuál es tu nombre o nombre de tu empresa?', question_type: 'text', order: 1 },
          { id: '2', question_text: '¿Cuál es tu número de contacto?', question_type: 'text', order: 2 },
          { id: '3', question_text: '¿Para qué fecha necesitas el servicio?', question_type: 'date', order: 3 },
          { id: '4', question_text: '¿Cuántas personas asistirán?', question_type: 'number', order: 4 },
          { id: '5', question_text: '¿Qué tipo de evento es?', question_type: 'choice', options: ['Cumpleaños', 'Boda', 'Evento Empresarial', 'Reunión Familiar', 'Otro'], order: 5 },
        ];
        setQuestions(defaultQuestions);
        setMessages([
          {
            type: 'bot',
            text: '¡Hola! Soy tu asistente virtual. Te haré algunas preguntas para ayudarte mejor. 😊'
          },
          {
            type: 'bot',
            text: defaultQuestions[0].question_text
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    
    // Add user answer to messages
    setMessages(prev => [...prev, { type: 'user', text: userInput }]);
    
    // Save answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.question_text]: userInput
    }));

    setUserInput('');

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      const nextQuestion = questions[currentQuestionIndex + 1];
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: nextQuestion.question_text
        }]);
      }, 500);
    } else {
      // All questions answered
      setIsComplete(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: '¡Gracias por tu información! Te contactaremos pronto. 🎉'
        }]);
      }, 500);
      
      // Send to backend
      submitQuotation();
    }
  };

  const handleOptionClick = (option) => {
    setUserInput(option);
    setTimeout(() => handleSubmit(), 100);
  };

  const submitQuotation = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/cms/quotations`, {
        client_name: answers['¿Cuál es tu nombre o nombre de tu empresa?'] || 'Sin nombre',
        client_phone: answers['¿Cuál es tu número de contacto?'] || '',
        event_date: answers['¿Para qué fecha necesitas el servicio?'] || null,
        guests_count: parseInt(answers['¿Cuántas personas asistirán?']) || null,
        event_type: answers['¿Qué tipo de evento es?'] || null,
        chatbot_responses: answers,
        selected_villas: [],
        selected_services: []
      });
      
      // Open WhatsApp after 2 seconds
      setTimeout(() => {
        const message = encodeURIComponent(
          `Hola! He completado el formulario del chatbot.\n` +
          `Nombre: ${answers['¿Cuál es tu nombre o nombre de tu empresa?']}\n` +
          `Teléfono: ${answers['¿Cuál es tu número de contacto?']}\n` +
          `Fecha: ${answers['¿Para qué fecha necesitas el servicio?']}\n` +
          `Personas: ${answers['¿Cuántas personas asistirán?']}\n` +
          `Tipo de evento: ${answers['¿Qué tipo de evento es?']}`
        );
        window.open(`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER.replace(/\+/g, '')}?text=${message}`, '_blank');
      }, 2000);
    } catch (error) {
      console.error('Error submitting quotation:', error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      {/* ChatBot Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '60px',
            height: '60px',
            background: '#080644',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 3px 15px rgba(0,0,0,0.3)',
            zIndex: 998,
            transition: 'transform 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Abrir chat de cotización"
        >
          <FaComment />
        </button>
      )}

      {/* ChatBot Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Asistente Virtual</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-body" style={{ display: 'flex', flexDirection: 'column' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-message ${msg.type}`}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  borderRadius: '10px',
                  maxWidth: '80%',
                  background: msg.type === 'bot' ? '#EDDEBB' : '#080644',
                  color: msg.type === 'bot' ? '#333' : 'white',
                  alignSelf: msg.type === 'bot' ? 'flex-start' : 'flex-end',
                  marginLeft: msg.type === 'user' ? 'auto' : '0'
                }}
              >
                {msg.text}
              </div>
            ))}

            {/* Options for choice questions */}
            {!isComplete && currentQuestion && currentQuestion.question_type === 'choice' && currentQuestion.options && (
              <div style={{ marginTop: '10px' }}>
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px',
                      marginBottom: '8px',
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Area */}
          {!isComplete && currentQuestion && currentQuestion.question_type !== 'choice' && (
            <div className="chatbot-input">
              <input
                type={currentQuestion.question_type === 'number' ? 'number' : currentQuestion.question_type === 'date' ? 'date' : 'text'}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Escribe tu respuesta..."
                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
              <button
                onClick={handleSubmit}
                style={{
                  padding: '10px 15px',
                  background: '#080644',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                <FaPaperPlane />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;
