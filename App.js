import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { Provider as PaperProvider, Appbar, Provider } from 'react-native-paper';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';

export default function App() {
  return (
    <PaperProvider>
      <AppContent />
    </PaperProvider>
  );
}

function AppContent() {
  const renderCallout = (markerTitle, markerDescription) => (
    <View>
      <Text style={{ fontWeight: 'bold' }}>{markerTitle}</Text>
      <Text>{markerDescription}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <Appbar.Header style={{ backgroundColor: 'black' }}>
        <Appbar.Content title="Social Vibe!" titleStyle={{ color: 'white' }} />
      </Appbar.Header>
      <MapView
        style={{ flex: 1 }}
        // style= {StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 45.4215,
          longitude: -75.6993,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Marker 1 - Downtown Ottawa */}
        <Marker
          coordinate={{ latitude: 45.4215, longitude: -75.6993 }}
          title="Downtown Ottawa"
          description="Heart of the city"
        >
          <Callout>{renderCallout("Downtown Ottawa", "Heart of the city")}</Callout>
        </Marker>

        {/* Marker 2 - Parliament Hill */}
        <Marker
          coordinate={{ latitude: 45.4235, longitude: -75.6985 }}
          title="Parliament Hill"
          description="Political hub"
        >
          <Callout>{renderCallout("Parliament Hill", "Political hub")}</Callout>
        </Marker>

        {/* Marker 3 - Canadian Museum of History */}
        <Marker
          coordinate={{ latitude: 45.4312, longitude: -75.7090 }}
          title="Canadian Museum of History"
          description="Cultural landmark"
        >
          <Callout>
            {renderCallout("Canadian Museum of History", "Cultural landmark")}
          </Callout>
        </Marker>
      </MapView>
    </View>
  );
}
