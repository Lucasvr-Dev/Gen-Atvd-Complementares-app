import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SideDrawer from "../../../app/componentes/SideDrawer";
import { useDrawerNavigation } from "../../../app/hooks/userDrawerNavigation";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { styles } from "./style";

export default function RegrasCursoScreen() {
  const insets = useSafeAreaInsets();
  const currentUser = useCurrentUser(); // ← aqui dentro
  const { drawerOpen, openDrawer, closeDrawer, handleSelect, handleLogout } =
    useDrawerNavigation("regras");

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={openDrawer}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Ionicons name="school" size={18} color="#6366F1" />
          <Text style={styles.topBarTitle}>Atividades Complementares</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Regras do Curso</Text>
        <Text style={styles.pageSubtitle}>
          Confira as normas para atividades complementares
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>
            Conteúdo da tela de regras virá aqui.
          </Text>
        </View>
      </ScrollView>

      <SideDrawer
        visible={drawerOpen}
        onClose={closeDrawer}
        user={currentUser}
        activeItem="regras"
        onSelect={handleSelect}
        onLogout={handleLogout}
      />
    </View>
  );
}
