import React from "react";
import { StyleSheet, Text, View } from "react-native";

type ProgressBarProps = {
  title: string;
  percentage: number;
};

const ProgressBar = ({title, percentage}:ProgressBarProps) => {

//const formattedPercentage = Math.round(percentage * 10) / 10;
const formattedPercentage = percentage.toFixed(1);    // pads with trailing 0

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.row}>
          <Text style={styles.rowTitle}> {title}</Text>
          <Text style={styles.rowPercent}> {formattedPercentage}%</Text>
        </View>
      )}

      <View style={styles.track}>
        <View style={[ {width: `${percentage}%`}, styles.progress]}>
          <Text style={styles.labelInBar} numberOfLines={1}>{formattedPercentage}%</Text>
        </View>
      </View>
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
    container : {
        display: "flex",
        padding: 4,
        justifyContent: "flex-start",
        alignItems: "stretch"
    },
  row: {
    flexDirection: "row",
    justifyContent:'space-between',
    width: "100%",
  },
  rowTitle: {
    fontSize: 24,
    padding: 4
  },
  rowPercent: {
    fontSize: 24,
    fontWeight: 800
  },
  track: {
    backgroundColor: "#1F2937",
    height: 40,
    width: "100%",
    borderRadius: 10,
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
  },
  progress: {
    backgroundColor: "#374151",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
    paddingHorizontal: 4
  },
  labelInBar: {
    color: "#E5E7EB",
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 0
  },
  percentageText: {
    position: "absolute",
    right: 12,
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "700"
  }
});
