import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SideDrawer from "../../../app/componentes/SideDrawer";
import { useDrawerNavigation } from "../../../app/hooks/userDrawerNavigation";
import { styles } from "./style";

const currentUser = { name: "Vitor Shampo", email: "vitorshampo@gmail.com" };
const CATEGORIAS = ["Pesquisa", "Extensão", "Ensino", "Cultura", "Esporte"];

export default function NovaSubmissaoScreen() {
  const insets = useSafeAreaInsets();
  const { drawerOpen, openDrawer, closeDrawer, handleSelect, handleLogout } =
    useDrawerNavigation("submissao");

  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivoNome, setArquivoNome] = useState<string | null>(null);
  const [categoriaOpen, setCategoriaOpen] = useState(false);

  const handleEscolherArquivo = () => setArquivoNome("certificado-exemplo.pdf");
  const handleTirarFoto = () => setArquivoNome("foto-certificado.jpg");

  const isFormValid =
    titulo.trim() !== "" &&
    categoria.trim() !== "" &&
    dataInicio.trim() !== "" &&
    cargaHoraria.trim() !== "" &&
    arquivoNome !== null;

  const handleSubmit = () => {
    if (!isFormValid) return;
    console.log("Submetendo:", {
      titulo,
      categoria,
      dataInicio,
      cargaHoraria,
      descricao,
      arquivoNome,
    });
  };

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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Nova Atividade</Text>
          <Text style={styles.pageSubtitle}>
            Submeta um certificado de atividade complementar
          </Text>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>
              Título da Atividade <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Seminario de Inteligencia Artificial"
                placeholderTextColor="#9CA3AF"
                value={titulo}
                onChangeText={setTitulo}
              />
            </View>

            <Text style={[styles.fieldLabel, styles.mt18]}>
              Categoria <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setCategoriaOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, !categoria && { color: "#9CA3AF" }]}>
                {categoria || "Selecione uma categoria"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color="#6B7280"
                style={styles.dropdownChevron}
              />
            </TouchableOpacity>

            <Text style={[styles.fieldLabel, styles.mt18]}>
              Data de Inicio <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9CA3AF"
                value={dataInicio}
                onChangeText={setDataInicio}
                keyboardType="numeric"
              />
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#6B7280"
                style={styles.dropdownChevron}
              />
            </View>

            <Text style={[styles.fieldLabel, styles.mt18]}>
              Carga Horaria (horas) <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ex: 10"
                placeholderTextColor="#9CA3AF"
                value={cargaHoraria}
                onChangeText={setCargaHoraria}
                keyboardType="numeric"
              />
            </View>

            <Text style={[styles.fieldLabel, styles.mt18]}>Descricao</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Breve descricao da atividade realizada"
                placeholderTextColor="#9CA3AF"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <Text style={[styles.fieldLabel, styles.mt18]}>
              Certificado / Comprovante <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.uploadCard}>
              <View style={styles.uploadIconCircle}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={28}
                  color="#6366F1"
                />
              </View>
              <Text style={styles.uploadHint}>
                {arquivoNome ?? "PDF, JPG ou PNG (max 5MB)"}
              </Text>

              <View style={styles.uploadActions}>
                <TouchableOpacity
                  style={styles.uploadPrimaryBtn}
                  onPress={handleEscolherArquivo}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.uploadPrimaryText}>Escolher</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadSecondaryBtn}
                  onPress={handleTirarFoto}
                  activeOpacity={0.85}
                >
                  <Ionicons name="camera-outline" size={16} color="#374151" />
                  <Text style={styles.uploadSecondaryText}>Tirar Foto</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={!isFormValid}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Enviar Atividade</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={categoriaOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoriaOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoriaOpen(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Categoria</Text>
            {CATEGORIAS.map((cat) => {
              const active = cat === categoria;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => {
                    setCategoria(cat);
                    setCategoriaOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemLabel,
                      active && styles.modalItemLabelActive,
                    ]}
                  >
                    {cat}
                  </Text>
                  {active && (
                    <Ionicons name="checkmark" size={18} color="#6366F1" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      <SideDrawer
        visible={drawerOpen}
        onClose={closeDrawer}
        user={currentUser}
        activeItem="submissao"
        onSelect={handleSelect}
        onLogout={handleLogout}
      />
    </View>
  );
}
