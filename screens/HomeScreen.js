import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "../config";

const { width } = Dimensions.get("window");
const getCardDimensions = () => {
  if (width > 1200) return { cardWidth: width / 6 - 20 }; // 6 cards per row
  if (width > 768) return { cardWidth: width / 4 - 20 }; // 4 cards per row
  return { cardWidth: width / 2.5 - 20 }; // 2.5 cards per row
};

export default function HomeScreen({ navigation }) {
  const [moviesByGenre, setMoviesByGenre] = useState([]);

  const { cardWidth } = getCardDimensions();
  const cardHeight = (cardWidth / 2) * 3;

  useEffect(() => {
    axios
      .get(`${API_URL}/movies/genres`)
      .then((response) => {
        setMoviesByGenre(response.data);
      })
      .catch((error) => console.error("Error fetching movies:", error));
  }, []);

  const renderMovieCard = ({ item }) => (
    <View
      style={[styles.movieCard, { width: cardWidth, height: cardHeight }]}
      className="hoverable" // Add hoverable class
    >
      <TouchableOpacity
        onPress={() => navigation.navigate("MovieDetails", { movieId: item._id })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.poster }} style={styles.poster} />
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.averageRating || "N/A"}</Text>
        </View>
        <Text style={styles.movieTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.movieReleaseDate}>{item.releaseDate}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {moviesByGenre.map((genre) => (
        <View key={genre._id} style={styles.genreSection}>
          <Text style={styles.genreTitle}>{genre._id}</Text>
          <FlatList
            data={genre.movies}
            renderItem={renderMovieCard}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.movieListContainer}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  genreSection: {
    marginBottom: 20,
  },
  genreTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    marginBottom: 10,
  },
  movieListContainer: {
    paddingHorizontal: 10,
  },
  movieCard: {
    backgroundColor: "#1c1c1c",
    borderRadius: 8,
    marginRight: 10,
    overflow: "hidden",
    transition: "transform 0.3s, box-shadow 0.3s", // Transition effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  poster: {
    width: "100%",
    height: "70%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  ratingText: {
    color: "#FFD700",
    marginLeft: 5,
  },
  movieTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  movieReleaseDate: {
    color: "#bbb",
    fontSize: 12,
    textAlign: "center",
    marginTop: 3,
  },
});

// Add hover style for web
if (Platform.OS === "web") {
  const style = document.createElement("style");
  style.textContent = `
    .hoverable:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }
  `;
  document.head.appendChild(style);
}
