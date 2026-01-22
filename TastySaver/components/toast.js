import Toast from 'react-native-root-toast';

const COLORS = {
  brown: '#7e453e',      
  darkBrown: '#7e453e',  
  text: '#fff',         
};

export const showToast = (message, type = 'info') => {
 
  const backgroundColor = COLORS.brown;
  const textColor = COLORS.text;
  let icon = '';

  switch (type) {
    case 'error':
      icon = '❌ ';
      break;
    case 'success':
      icon = '✅ ';
      break;
    case 'warning':
      icon = '⚠️ ';
      break;
    default:
      icon = 'ℹ️ ';
  }

  Toast.show(`${icon}${message}`, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.BOTTOM,
    backgroundColor,
    shadow: true,
    opacity: 1,
    containerStyle: {
      borderRadius: 24,
      marginTop: 56,
      paddingHorizontal: 24,
      paddingVertical: 14,
      alignSelf: 'center',
      minWidth: '70%',
      maxWidth: '90%',
      elevation: 8,
      shadowColor: COLORS.darkBrown,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
    },
    textStyle: {
      fontFamily: 'RubikMedium',
      fontSize: 16,
      color: textColor,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
  });
};
