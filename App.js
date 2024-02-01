import React, { useState } from 'react';
import { View, Text, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    setTracksViewChanges(false);
  };

  const handleOverlayPress = () => {
    setSelectedMarker(null); // Hide the rectangle box
    setTracksViewChanges(true);
  };

  const customMapStyle = [
    {
      elementType: 'geometry',
      stylers: [
        {
          color: '#000000', // Set the background color to dark blue
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#000' }], // Set the road color to black
    },
    {
      featureType: 'road',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }], // Hide road labels
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#0f1c2f' }], // Set the buildings color to a dark teal
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
            {/* Markers without Callouts */}
            <Marker
              coordinate={{ latitude: 45.4215, longitude: -75.6993 }}
              pinColor="purple" // Set marker color to blue
              onPress={() => handleMarkerPress("Downtown Ottawa")}
            />

            <Marker
              coordinate={{ latitude: 45.4235, longitude: -75.6985 }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Parliament Hill")}
            />

            <Marker
              coordinate={{ latitude: 45.4312, longitude: -75.7090 }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Canadian Museum of History")}
            />

            <Marker
              coordinate={{ latitude: 45.41577178429337, longitude: -75.70229814559288 }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Club 101")}
            />




            <Marker
              coordinate={{ latitude: 45.41742413342023, longitude: -75.70639048388583 }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Some Club")}
            />



            <Marker
              coordinate={{ latitude: 45.42996784145393, longitude: -75.69155855251739 }}
              pinColor="blue" // Set marker color to blue
              onPress={() => handleMarkerPress("Some Bar")}
            />



            <Marker
              coordinate={{ latitude: 45.415303393665674, longitude:  -75.69042194923313 }}
              pinColor="purple" // Set marker color to blue
              onPress={() => handleMarkerPress("Some Where")}
            />



          </MapView>
        </View>

        {/* Rectangle box at the bottom with marker name */}
        {selectedMarker && (
          <>
            <View style={styles.markerBox}>
              <Text style={styles.markerName}>{selectedMarker}</Text>
            </View>
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={handleOverlayPress}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  mapContainer: {
    flex: 1,
  },
  markerBox: {
    position: 'absolute',
    height: "10%",
    bottom: '89%', // Adjust this value to set the desired distance from the bottom
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});





  