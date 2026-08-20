import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/store/ThemeContext';
import { colors } from '@/constants/colors';
import { getBaseUrl } from '@/services/api';

interface AssistantModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export const AssistantModal: React.FC<AssistantModalProps> = ({ visible, onClose }) => {
  const { activeColors } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am AgriAI, your smart farming assistant. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async (retryText?: string) => {
    const textToSend = retryText || inputText.trim();
    if (!textToSend) return;

    let newHistory = messages;
    if (retryText) {
      // If retrying, remove the last error message
      newHistory = newHistory.slice(0, -1);
      setMessages(newHistory);
    } else {
      const userMessage: ChatMessage = { role: 'user', text: textToSend };
      newHistory = [...messages, userMessage];
      setMessages(newHistory);
      setInputText('');
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${getBaseUrl()}/api/assistant/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: newHistory.filter(m => m.role !== 'model' || m.text !== 'Hello! I am AgriAI, your smart farming assistant. How can I help you today?'),
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to get response';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || 'Sorry, I encountered an error connecting to the server.';
      setMessages(prev => [...prev, { role: 'model', text: errorMessage, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.modalOverlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalContainer, { backgroundColor: activeColors.background }]}>
          <View style={[styles.header, { borderBottomColor: activeColors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatar, { backgroundColor: colors.primary.subtle }]}>
                <Ionicons name="leaf" size={16} color={colors.primary.DEFAULT} />
              </View>
              <Text style={[styles.headerTitle, { color: activeColors.textPrimary }]}>AgriAI</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={activeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.chatArea} 
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg, index) => (
              <View 
                key={index} 
                style={[
                  styles.messageBubble, 
                  msg.role === 'user' ? styles.userBubble : [styles.modelBubble, { backgroundColor: activeColors.card, borderColor: activeColors.border }],
                  msg.isError && { borderColor: colors.status.error, borderWidth: 1 }
                ]}
              >
                <Text style={[
                  styles.messageText, 
                  msg.role === 'user' ? styles.userText : { color: msg.isError ? colors.status.error : activeColors.textPrimary }
                ]}>
                  {msg.text}
                </Text>
                {msg.isError && index === messages.length - 1 && (
                  <TouchableOpacity 
                    style={styles.retryBtn} 
                    onPress={() => {
                      const lastUserMsg = messages[messages.length - 2]?.text;
                      if (lastUserMsg) {
                        sendMessage(lastUserMsg);
                      }
                    }}
                  >
                    <Ionicons name="refresh" size={14} color={colors.status.error} />
                    <Text style={styles.retryBtnText}>Retry</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {isLoading && (
              <View style={[styles.messageBubble, styles.modelBubble, { backgroundColor: activeColors.card, borderColor: activeColors.border, alignSelf: 'flex-start' }]}>
                <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputArea, { borderTopColor: activeColors.border, backgroundColor: activeColors.card }]}>
            <TextInput
              style={[styles.input, { color: activeColors.textPrimary, backgroundColor: activeColors.background, borderColor: activeColors.border }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me about farming..."
              placeholderTextColor={activeColors.textSecondary}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, (!inputText.trim() || isLoading) && { opacity: 0.5 }]} 
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary.DEFAULT,
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    borderRadius: 8,
  },
  retryBtnText: {
    color: colors.status.error,
    fontSize: 13,
    fontWeight: '600',
  }
});
