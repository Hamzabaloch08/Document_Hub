import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
  focused?: boolean;
}

export const HomeIcon = ({ color, size = 24, focused }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5L12 3L21 9.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9.5Z"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 21V12H15V21"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GlobeIcon = ({ color, size = 24, focused }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
    />
    <Path
      d="M3.6 9H20.4M3.6 15H20.4"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
    />
    <Path
      d="M12 3C14.5013 3 16.5 7.02944 16.5 12C16.5 16.9706 14.5013 21 12 21C9.49873 21 7.5 16.9706 7.5 12C7.5 7.02944 9.49873 3 12 3Z"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
    />
  </Svg>
);

export const LayersIcon = ({ color, size = 24, focused }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 17L12 22L22 17M2 12L12 17L22 12M12 2L2 7L12 12L22 7L12 2Z"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UserIcon = ({ color, size = 24, focused }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9422 19.5786 16.9278 18.8284 16.1777C18.0783 15.4275 17.0639 15.006 16 15.006H8C6.93606 15.006 5.92172 15.4275 5.17157 16.1777C4.42143 16.9278 4 17.9422 4 19V21"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
    />
  </Svg>
);
