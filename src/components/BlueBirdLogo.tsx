import React from "react";
import { View, StyleSheet, Image } from "react-native";

type Props = {
  width?: number;
  height?: number;
};

export function BlueBirdLogo({ width = 220, height = 150 }: Props) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require("../assets/bluebird-logo.png")}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" }
});
