import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, useWindowDimensions} from "react-native";


const Temperament = {
  Melancholic: "melancholic",
  Phlegmatic: "phlegmatic",
  Sanguine: "sanguine",
  Choleric: "choleric",
} as const;

const questions = [
  { text: "Ви швидко приймаєте рішення?", type: Temperament.Choleric },
  { text: "Ви схильні до частих змін настрою?", type: Temperament.Melancholic },
  { text: "Ви легко заводите нові знайомства?", type: Temperament.Sanguine },
  { text: "Вам комфортніше працювати самостійно?", type: Temperament.Phlegmatic },
  { text: "Ви енергійні та активні?", type: Temperament.Choleric },
  { text: "Ви часто замислюєтесь над своїми емоціями?", type: Temperament.Melancholic },
  { text: "Ви зазвичай позитивні та життєрадісні?", type: Temperament.Sanguine },
  { text: "Ви терплячі та спокійні?", type: Temperament.Phlegmatic },
  { text: "Ви швидко втрачаєте терпіння?", type: Temperament.Choleric },
  { text: "Ви деталізуєте всі свої думки?", type: Temperament.Melancholic },
  { text: "Ви легко заводите нові знайомства на вечірках?", type: Temperament.Sanguine },
  { text: "Ви уникаєте конфліктів?", type: Temperament.Phlegmatic },
  { text: "Ви часто берете на себе лідерство?", type: Temperament.Choleric },
  { text: "Ви тривожитеся через дрібниці?", type: Temperament.Melancholic },
  { text: "Ви оптимістично дивитесь на світ?", type: Temperament.Sanguine },
  { text: "Ви рідко висловлюєте свої емоції?", type: Temperament.Phlegmatic },
];

const answers = [
  { label: "Зовсім ні", value: 0 },
  { label: "Іноді", value: 1 },
  { label: "Часто", value: 2 },
  { label: "Завжди", value: 3 },
];

const temperamentNames = {
  [Temperament.Melancholic]: "меланхолік",
  [Temperament.Phlegmatic]: "флегматик",
  [Temperament.Sanguine]: "сангвінік",
  [Temperament.Choleric]: "холерик",
};

export default function TemperamentTest() {
  const { width } = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState({
    [Temperament.Choleric]: 0,
    [Temperament.Melancholic]: 0,
    [Temperament.Sanguine]: 0,
    [Temperament.Phlegmatic]: 0,
  });

  const handleAnswer = (value: number) => {
    const currentQuestion = questions[index];

    setScores((prev) => ({
      ...prev,
      [currentQuestion.type]: prev[currentQuestion.type] + value,
    }));

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      showResult();
    }
  };

  const showResult = () => {
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const totalSafe = total === 0 ? 1 : total;

    const maxType = Object.entries(scores).reduce(
      (prev, curr) => (curr[1] > prev[1] ? curr : prev),
      ["", -1]
    )[0];

    const percentages = Object.fromEntries(
      Object.entries(scores).map(([key, val]) => [key, ((val / totalSafe) * 100).toFixed(1)])
    );

    Alert.alert(
      `Ваш темперамент: ${temperamentNames[maxType]}`,
      `Профіль:\n` +
        Object.entries(percentages)
          .map(([key, val]) => `${temperamentNames[key]}: ${val}%`)
          .join("\n"),
      [
        {
          text: "OK",
          onPress: () => router.push("../"),
        },
      ]
    );
  };

  const progress = ((index + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <View style={[styles.question, { width: width > 500 ? 400 : "90%" }]}>
        <Text style={styles.questionText}>{questions[index].text}</Text>
      </View>

      <View style={[styles.answerButtons, { width: width > 500 ? 400 : "90%" }]}>
        {answers.map((ans) => (
          <Pressable
            key={ans.value}
            style={({ pressed }) => [
              styles.link,
              pressed && styles.linkPressed,
            ]}
            onPress={() => handleAnswer(ans.value)}
          >
            <View style={styles.linkContent}>
              <View style={styles.iconBox}>
                <Text style={{ color: "#1b1f23", fontWeight: "bold" }}>{ans.value}</Text>
              </View>
              <Text style={styles.linkText}>{ans.label}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={styles.progressText}>
        Питання {index + 1} з {questions.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b1f23",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  progressBarBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#333",
    borderRadius: 5,
    marginBottom: 20,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#38b000",
    borderRadius: 5,
  },
  question: {
    backgroundColor: "#2a2e33",
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#38b000",
  },
  questionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  answerButtons: {
    flexDirection: "column",
    gap: 12,
  },
  link: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginVertical: 6,
    borderWidth: 2,
    borderColor: "#38b000",
    backgroundColor: "transparent",
  },
  linkPressed: {
    backgroundColor: "#38b00033",
    transform: [{ scale: 0.98 }],
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#38b000",
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.8,
  },
  progressText: {
    marginTop: 20,
    fontSize: 16,
    color: "#aaa",
  },
});
