import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <View>
      <Text>HomeScreen</Text>

      <Button title="Go Here" onPress={() => navigation.navigate("Profile")} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
