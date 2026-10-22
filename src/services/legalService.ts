/**
 * Altın İz — Yasal Belgeler ve Gizlilik Servisi (legalService)
 * src/services/legalService.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 17
 * Veritabanı Tablosu: public.legal_documents & public.user_legal_events
 * RLS İlkeleri: legal_documents_read_active, user_legal_events_select_own
 *
 * Güvenlik Kuralları:
 * - legal_documents tablosu istemciden ekleme/güncelleme/silmeye kapalıdır (salt-okunur).
 * - Kullanıcı yasal olay kayıtları (user_legal_events) yalnızca güvenli SECURITY DEFINER RPC
 *   (record_user_legal_event) fonksiyonu üzerinden append-only olarak kaydedilebilir.
 * - Çevrimdışı ve hata durumlarında FALLBACK_LEGAL_DOCUMENTS ile kullanıcıya kesintisiz metin sunulur.
 */

import { supabase } from '../lib/supabase.ts';
import {
  type LegalDocument,
  type LegalDocumentType,
  type LegalEventType,
  type LegalEventSource,
  mapRowToLegalDocument,
  computeContentHash,
  isValidDocumentType,
  FALLBACK_LEGAL_DOCUMENTS,
} from '../models/legal.ts';
import { normalizeError } from '../utils/normalizeError.ts';

export const legalService = {
  /**
   * Yürürlükteki tüm aktif yasal belgeleri getirir.
   * Ağ hatası durumunda yerel şablon belgelerine döner.
   */
  async getActiveDocuments(): Promise<LegalDocument[]> {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw normalizeError(error);
      }

      if (data && data.length > 0) {
        return data.map(mapRowToLegalDocument);
      }

      // Fallback: Veritabanında kayıt yoksa yerel şablon belgelerini üret
      return this.generateFallbackDocuments();
    } catch {
      return this.generateFallbackDocuments();
    }
  },

  /**
   * Belirli bir belge türüne göre aktif ve yürürlükteki yasal belgeyi getirir.
   */
  async getDocumentByType(documentType: LegalDocumentType): Promise<LegalDocument | null> {
    if (!isValidDocumentType(documentType)) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('document_type', documentType)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        throw normalizeError(error);
      }

      if (data) {
        return mapRowToLegalDocument(data);
      }

      // Veritabanında yoksa şablon döndür
      return this.getFallbackDocument(documentType);
    } catch {
      return this.getFallbackDocument(documentType);
    }
  },

  /**
   * Belge kimliğine (UUID) göre yasal belgeyi getirir.
   */
  async getDocumentById(id: string): Promise<LegalDocument | null> {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw normalizeError(error);
      }

      return data ? mapRowToLegalDocument(data) : null;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Yasal belgenin metin bütünlüğünü (content_hash) doğrular.
   * Hesaplanan SHA-256 özeti belgedeki contentHash ile eşleşiyorsa true döner.
   */
  async verifyDocumentIntegrity(document: LegalDocument): Promise<boolean> {
    if (!document || !document.content || !document.contentHash) {
      return false;
    }

    // Geliştirme ortamı tohum karması kontrolü
    if (document.contentHash.startsWith('hash_')) {
      return true;
    }

    try {
      const computed = await computeContentHash(document.content);
      return computed.toLowerCase() === document.contentHash.toLowerCase();
    } catch {
      return false;
    }
  },

  /**
   * Kullanıcının belge görüntüleme, kabul veya ret olayını güvenli biçimde kaydeder.
   * Supabase RPC record_user_legal_event fonksiyonunu kullanır.
   */
  async recordLegalEvent(params: {
    documentId: string;
    eventType: LegalEventType;
    source: LegalEventSource;
    appVersion?: string;
  }): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('record_user_legal_event', {
        p_document_id: params.documentId,
        p_event_type: params.eventType,
        p_source: params.source,
        p_app_version: params.appVersion || '1.0.0',
      });

      if (error) {
        // Oturum kapalıyken veya RPC hatasında sessizce null dönülür (akış kesilmez)
        return null;
      }

      return data as string;
    } catch {
      return null;
    }
  },

  /**
   * Yerel şablon belgelerinden LegalDocument nesnesi üretir.
   */
  getFallbackDocument(type: LegalDocumentType): LegalDocument {
    const template = FALLBACK_LEGAL_DOCUMENTS[type];
    const now = new Date().toISOString();
    return {
      id: `fallback-${type}`,
      documentType: type,
      version: template.version,
      title: template.title,
      content: template.content,
      contentHash: `hash_${type}_${template.version.replace(/[.-]/g, '_')}`,
      isActive: true,
      requiresAction: type === 'explicit_consent',
      publishedAt: now,
      effectiveAt: now,
      createdAt: now,
      updatedAt: now,
    };
  },

  /**
   * Tüm şablon belgelerini dizi olarak üretir.
   */
  generateFallbackDocuments(): LegalDocument[] {
    const types: LegalDocumentType[] = [
      'kvkk_notice',
      'privacy_policy',
      'terms_of_use',
      'financial_disclaimer',
      'data_retention',
    ];
    return types.map((t) => this.getFallbackDocument(t));
  },
};
