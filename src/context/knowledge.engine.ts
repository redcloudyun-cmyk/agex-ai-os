import { generateResourceId, getCurrentISOString } from '../common/utils.js';

export type KnowledgeClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export interface KnowledgeDocument {
  document_id: string;
  source_id: string;
  title: string;
  classification: KnowledgeClassification;
  content: string;
}

export interface KnowledgeCandidate {
  document_id: string;
  title: string;
  snippet: string;
  classification: KnowledgeClassification;
}

export class KnowledgeEngine {
  private documents: Map<string, KnowledgeDocument> = new Map();

  public addDocument(doc: Omit<KnowledgeDocument, 'document_id'>): KnowledgeDocument {
    const document_id = generateResourceId('knc');
    const document: KnowledgeDocument = {
      ...doc,
      document_id,
    };
    this.documents.set(document_id, document);
    return document;
  }

  public retrieveCandidates(
    query: string,
    allowedClassifications: KnowledgeClassification[]
  ): KnowledgeCandidate[] {
    const results: KnowledgeCandidate[] = [];

    for (const doc of this.documents.values()) {
      // 1. ACL Filter BEFORE Candidate Generation (Rule 86 from S-05/S-03)
      if (!allowedClassifications.includes(doc.classification)) {
        continue;
      }

      // 2. Simple keyword matching
      if (doc.title.toLowerCase().includes(query.toLowerCase()) || doc.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          document_id: doc.document_id,
          title: doc.title,
          snippet: doc.content.substring(0, 100),
          classification: doc.classification,
        });
      }
    }

    return results;
  }
}
