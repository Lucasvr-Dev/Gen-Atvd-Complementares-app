import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { styles } from "./style";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

export type MenuItemKey =
  | "dashboard"
  | "submissao"
  | "historico"
  | "regras"
  | "notificacoes";

interface MenuItem {
  key: MenuItemKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const MENU_ITEMS: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "grid-outline" },
  { key: "submissao", label: "Nova Submissão", icon: "cloud-upload-outline" },
  { key: "historico", label: "Histórico de Submissões", icon: "time-outline" },
  { key: "regras", label: "Regras do Curso", icon: "book-outline" },
  { key: "notificacoes", label: "Notificações", icon: "notifications-outline" },
];

interface User {
  name: string;
  email: string;
}

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  user: User;
  activeItem: MenuItemKey;
  onSelect: (item: MenuItemKey) => void;
  onLogout: () => void;
}

export default function SideDrawer({
  visible,
  onClose,
  user,
  activeItem,
  onSelect,
  onLogout,
}: SideDrawerProps) {
  const insets = useSafeAreaInsets();

  const translateX = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  const [isMounted, setIsMounted] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(() => setIsMounted(false));
    }
  }, [visible, translateX, overlayOpacity]);

  const avatarInitial = user.name.charAt(0).toUpperCase();

  const handleSelect = (key: MenuItemKey) => {
    onSelect(key);
    onClose();
  };

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Animated.View
        style={[styles.overlayContainer, { opacity: overlayOpacity }]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <Pressable style={styles.overlayPressable} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.menuList}
          contentContainerStyle={styles.menuListContent}
          showsVerticalScrollIndicator={false}
        >
          {MENU_ITEMS.map((item) => {
            const active = item.key === activeItem;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuItem, active && styles.menuItemActive]}
                onPress={() => handleSelect(item.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color="#FFFFFF"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#FFFFFF"
            style={styles.menuIcon}
          />
          <Text style={styles.logoutLabel}>Sair</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}
