# Configuration des permissions Android

Pour utiliser l'upload d'images, ajoutez ces permissions dans `android/app/src/main/AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## Installation des dépendances

```bash
cd mobile-app
npm install react-native-image-picker
```

### Pour React Native 0.60+
```bash
cd ios && pod install
```

### Configuration iOS (ios/Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>Cette app a besoin d'accéder à la caméra pour prendre des photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Cette app a besoin d'accéder à la galerie pour sélectionner des images</string>
```