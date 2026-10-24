/**
 * Altın İz — Yardım ve Destek Ekranı (support)
 *
 * Müşteri desteği iletişim kanalları, sıkça sorulan sorular (SSS) ve veri politikası kılavuzları.
 */

import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useTheme } from '@/hooks/useTheme';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'Fiyatlar ne sıklıkla güncellenir?',
    answer:
      'Piyasa açık olduğu saatlerde fiyatlar sunucu tarafındaki otomatik zamanlayıcılar ve önbellek mekanizmalarıyla düzenli olarak güncellenir. 15 dakikadan eski fiyatlar arayüzde "Gecikmeli Veri" olarak etiketlenir.',
  },
  {
    question: 'Portföyümdeki kâr/zarar nasıl hesaplanır?',
    answer:
      'Kâr ve zarar durumu, her altın türü için girdiğiniz alış birim fiyatı ve miktarı ile güncel piyasa satış fiyatı karşılaştırılarak ağırlıklı ortalama yöntemiyle anlık hesaplanır.',
  },
  {
    question: 'Verilerim ve birikim bilgilerim güvende mi?',
    answer:
      'Evet. Portföy kayıtlarınız PostgreSQL Row Level Security (RLS) kural setleriyle kilitlidir. Yalnızca şifrelenmiş kimliğinizle erişilebilir; sistem yöneticileri dahil hiç kimse kişisel varlıklarınızı görüntüleyemez.',
  },
  {
    question: 'İnternet bağlantım yokken uygulamayı kullanabilir miyim?',
    answer:
      'İnternet kesintisi durumunda önceden yüklenmiş fiyatlar ve son portföy durumunuz güvenli yerel önbellek üzerinden görüntülenir. Yeni veri eklemek için internet bağlantısı gerekir.',
  },
  {
    question: 'Hesabımı ve tüm verilerimi nasıl silebilirim?',
    answer:
      'Hesabım > Güvenlik & Veri Yönetimi sekmesinden "Hesabımı Kalıcı Olarak Sil" butonuna basabilir veya web sitemizdeki (altiniz.app/hesap-silme) form aracılığıyla KVKK/GDPR kapsamında anında ve geri döndürülemez şekilde sildirebilirsiniz.',
  },
  {
    question: 'Altın İz yatırım tavsiyesi verir mi?',
    answer:
      'Hayır. Uygulama yalnızca bireysel birikimlerinizi kayıt altına almanız ve piyasa fiyatlarını izlemeniz için bir finansal araçtır. SPK mevzuatı kapsamında kesinlikle yatırım danışmanlığı yapılmaz.',
  },
];

export default function SupportScreen() {
  const { theme } = useTheme();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:destek@altiniz.app?subject=Altın İz Destek Talebi').catch(() => {});
  };

  const handleOpenAccountDeletionWeb = () => {
    Linking.openURL('https://altiniz.app/hesap-silme').catch(() => {});
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://altiniz.app').catch(() => {});
  };

  return (
    <ScreenContainer scrollable={true} contentContainerStyle={styles.container}>
      {/* Destek Kartı */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: 'rgba(217, 119, 6, 0.12)', borderColor: theme.colors.gold },
            ]}
          >
            <Feather name="headphones" size={22} color={theme.colors.gold} />
          </View>
          <View style={styles.headerTexts}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Bize Ulaşın
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Sorularınız ve önerileriniz için buradayız
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleEmailSupport}
          style={[
            styles.contactBox,
            { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Destek e-postası gönder"
        >
          <View style={styles.contactLeft}>
            <Feather name="mail" size={20} color={theme.colors.gold} />
            <View>
              <Text style={[styles.contactLabel, { color: theme.colors.textTertiary }]}>
                Resmi Destek E-postası
              </Text>
              <Text style={[styles.contactEmail, { color: theme.colors.primary }]}>
                destek@altiniz.app
              </Text>
            </View>
          </View>
          <Feather name="external-link" size={16} color={theme.colors.textTertiary} />
        </Pressable>

        <View style={styles.slaRow}>
          <Feather name="clock" size={13} color={theme.colors.textTertiary} style={styles.slaIcon} />
          <Text style={[styles.slaText, { color: theme.colors.textTertiary }]}>
            İş günlerinde genellikle 24 saat içerisinde yanıt verilmektedir.
          </Text>
        </View>

        {/* Hızlı Bağlantılar */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={handleOpenWebsite}
            style={[
              styles.actionPill,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
            ]}
          >
            <Feather name="globe" size={13} color={theme.colors.gold} />
            <Text style={[styles.actionPillText, { color: theme.colors.textPrimary }]}>
              Web Portalı
            </Text>
          </Pressable>

          <Pressable
            onPress={handleOpenAccountDeletionWeb}
            style={[
              styles.actionPill,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
            ]}
          >
            <Feather name="user-x" size={13} color={theme.colors.loss} />
            <Text style={[styles.actionPillText, { color: theme.colors.textPrimary }]}>
              Hesap Silme Formu
            </Text>
          </Pressable>
        </View>
      </View>

      {/* SSS Başlığı */}
      <View style={styles.faqSectionHeader}>
        <Feather name="help-circle" size={18} color={theme.colors.gold} />
        <Text style={[styles.faqSectionTitle, { color: theme.colors.textPrimary }]}>
          Sıkça Sorulan Sorular
        </Text>
      </View>

      {/* SSS Listesi */}
      {FAQS.map((faq, index) => (
        <View
          key={index}
          style={[
            styles.faqCard,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.faqQuestion, { color: theme.colors.textPrimary }]}>
            {faq.question}
          </Text>
          <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>
            {faq.answer}
          </Text>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTexts: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  contactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 15,
    fontWeight: '700',
  },
  slaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  slaIcon: {
    marginRight: 6,
  },
  slaText: {
    fontSize: 11,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  faqSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  faqSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  faqCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 12,
    lineHeight: 18,
  },
});
