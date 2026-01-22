import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { View } from 'react-native';

export default function WaveBackground() {
  return (
    <View className="absolute inset-0 z-0">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 800"
        preserveAspectRatio="none"
        pointerEvents="none"
      >
        {/* White background */}
        <Rect width="400" height="800" fill="#f8ede3" />
        
        <Path
          fill="#80453F"
          d="M400,0 
             C300,300 100,50 0,400 
             L-300,-100 
             Z"
        />
        
        {/* Bottom-right to middle-left burgundy diagonal section */}
        <Path
          fill="#80453F"
          d="M0,800 
             C100,500 300,750 400,400 
             L700,900 
             Z"
        />
      </Svg>
    </View>
  );
}