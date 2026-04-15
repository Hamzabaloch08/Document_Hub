import { Feather } from "@expo/vector-icons";
import React from "react";

interface IconProps {
  color: string;
  size?: number;
  focused?: boolean;
}

export const HomeIcon = ({ color, size = 24 }: IconProps) => (
  <Feather name="grid" size={size} color={color} />
);

export const GlobeIcon = ({ color, size = 24 }: IconProps) => (
  <Feather name="globe" size={size} color={color} />
);

export const LayersIcon = ({ color, size = 24 }: IconProps) => (
  <Feather name="layers" size={size} color={color} />
);

export const UserIcon = ({ color, size = 24 }: IconProps) => (
  <Feather name="user" size={size} color={color} />
);
