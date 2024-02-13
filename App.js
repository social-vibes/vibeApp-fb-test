import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import BottomSheet from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <PaperProvider>
      <AppContent />
    </PaperProvider>
  );
}

function AppContent() {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const snapPoints = useMemo(() => ["15%", "25%", "80%"], []);
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  const handleCheckIn = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    setTracksViewChanges(false);
  };

  const handleBoxClose = () => {
    setSelectedMarker(null);
    setTracksViewChanges(true);
  };
  

  const handleDirectionsPress = () => {
    if (selectedMarker) {
      const location = encodeURIComponent(selectedMarker);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${location}`;
      Linking.openURL(url);
    }
  };

  const customMapStyle = [
    {
      elementType: "geometry",
      stylers: [
        {
          color: "#000000", // Set the background color to dark blue
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#000" }], // Set the road color to black
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "off" }], // Hide road labels
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#0f1c2f" }], // Set the buildings color to a dark teal
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [{ visibility: "off" }], // Hide administrative labels (neighborhood names)
    },
    // Add more styling rules as needed
  ];

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#102027" />

      <View style={styles.container}>
        {/* Full-screen Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={{ flex: 1 }}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: 45.4215,
              longitude: -75.6993,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            customMapStyle={customMapStyle} // Set the custom map style
            tracksViewChanges={tracksViewChanges} // Toggle to hide/show default callout
          >

            <Marker
              coordinate={{ latitude: 45.4215, longitude: -75.6993 }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Downtown Ottawa")}
            />

            <Marker
              coordinate={{ latitude: 45.4235, longitude: -75.6985 }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Parliament Hill")}
            />

            <Marker
              coordinate={{ latitude: 45.4312, longitude: -75.709 }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Canadian Museum of History")}
            />

            <Marker
              coordinate={{
                latitude: 45.41577178429337,
                longitude: -75.70229814559288,
              }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Club 101")}
            />

            <Marker
              coordinate={{
                latitude: 45.41742413342023,
                longitude: -75.70639048388583,
              }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Some Club")}
            />

            <Marker
              coordinate={{
                latitude: 45.42996784145393,
                longitude: -75.69155855251739,
              }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Some Bar")}
            />

            <Marker
              coordinate={{
                latitude: 45.415303393665674,
                longitude: -75.69042194923313,
              }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Some Where")}
            />
          </MapView>
        </View>

        <View style={styles.wow}>
         <View style={{flexDirection:"row" }}>
            <Text style={{padding:15, backgroundColor:"white" ,borderRadius: 20,}}>Bars </Text>
            <Text style={{padding:15 ,marginLeft: 70, backgroundColor:"white",borderRadius: 20,}}>Clubs</Text>
            <Text style={{padding:15 , marginLeft: 70, backgroundColor:"white",}}>Pubs</Text>

          </View>  
        </View>

        {/* Rectangle box at the bottom with marker name */}

        {selectedMarker && (
          <View style={styles.markerBox}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <BottomSheet snapPoints={snapPoints}>
                <TouchableWithoutFeedback onPress={handleBoxClose}>
                  <View style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>X</Text>
                  </View>
                </TouchableWithoutFeedback>
                <Text style={styles.markerName}>{selectedMarker}</Text>
                <TouchableOpacity
                  style={styles.checkInButton}
                  onPress={handleCheckIn}
                >
                  <Text style={styles.checkInButtonText}>Check In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={handleDirectionsPress}
                >
                  <Text style={styles.directionsButtonText}>Directions</Text>
                </TouchableOpacity>
              </BottomSheet>
            </GestureHandlerRootView>
          </View>
        )}
      </View>

      {/* Modal for Check In */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Hello World</Text>

            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeModalButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({


  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2, // Ensure the overlay is above the map but below the bottom sheet
  },
  wow: {
    width: "100%",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "absolute",
    bottom: "10%",

    flexDirection: "row",
  },
  modalContent: {
    backgroundColor: "red",
    width: "100%",
    height: "100%",
    top: "50%",
  },
  container: {
    flex: 1,
    flexDirection: "column",
  },
  mapContainer: {
    flex: 1,

  },
  markerBox: {
    position: "absolute",
    height: "100%",
    bottom: "0%",
    // margin: 10,
    left: 0,
    right: 0,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 50,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: "50%",
    resizeMode: "contain",
  },
  markerName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  directionsButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    bottom: "-5%",
  },

  checkInButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },

  directionsButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  checkInButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
