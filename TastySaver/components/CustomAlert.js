// // components/CustomAlert.js
// import React from 'react';
// import { Modal, View, Text, TouchableOpacity } from 'react-native';

// export default function CustomAlert({  
//   visible,  
//   title,  
//   message,  
//   onCancel,       // apelat când dai „OK” sau închizi  
//   onConfirm,      // apelat când există acțiune secundară  
//   confirmText = 'Continuă',  
//   cancelText = 'OK'  
// }) {
//   return (
//     <Modal
//       animationType="fade"
//       transparent
//       visible={visible}
//       onRequestClose={onCancel}
//     >
//       <View className="flex-1 justify-center items-center bg-black/50">
//         <View className="bg-white w-80 rounded-3xl p-6 items-center shadow-lg">
//           {title ? (
//             <Text className="text-xl font-bold text-[#5C2C1D] mb-2">
//               {title}
//             </Text>
//           ) : null}
//           <Text className="text-base text-[#5C2C1D] text-center mb-6">
//             {message}
//           </Text>

//           <View className="flex-row w-full space-x-2">
//             <TouchableOpacity
//               className="flex-1 bg-gray-200 rounded-full py-3"
//               onPress={onCancel}
//             >
//               <Text className="text-center font-semibold text-[#7e453e]">
//                 {cancelText}
//               </Text>
//             </TouchableOpacity>

//             {onConfirm ? (
//               <TouchableOpacity
//                 className="flex-1 bg-[#5C2C1D] rounded-full py-3"
//                 onPress={onConfirm}
//               >
//                 <Text className="text-center font-semibold text-white">
//                   {confirmText}
//                 </Text>
//               </TouchableOpacity>
//             ) : null}
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }
