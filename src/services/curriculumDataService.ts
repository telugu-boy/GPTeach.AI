// Curriculum Data Service - Handles Excel file parsing
import * as XLSX from 'xlsx';

export interface CurriculumOutcome {
  grade: string;
  strand: string;
  outcome: string;
  description: string;
}

let cachedOutcomes: CurriculumOutcome[] = [];
let isLoaded = false;

export async function loadCurriculumData(): Promise<CurriculumOutcome[]> {
  if (isLoaded) {
    return cachedOutcomes;
  }

  try {
    // Fetch the Excel file
    const response = await fetch('/mathematics_outcomes_k9_complete.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    
    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
    
    // Parse the data (assuming first row is headers)
    const outcomes: CurriculumOutcome[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row.length >= 3) {
        outcomes.push({
          grade: String(row[0] || ''),
          strand: String(row[1] || ''),
          outcome: String(row[2] || ''),
          description: String(row[3] || ''),
        });
      }
    }
    
    cachedOutcomes = outcomes;
    isLoaded = true;
    
    return outcomes;
  } catch (error) {
    console.error('Error loading curriculum data:', error);
    return getFallbackOutcomes();
  }
}

export function searchOutcomes(query: string, grade?: string): CurriculumOutcome[] {
  const lowerQuery = query.toLowerCase();
  
  let filtered = cachedOutcomes.filter(outcome => 
    outcome.outcome.toLowerCase().includes(lowerQuery) ||
    outcome.description.toLowerCase().includes(lowerQuery) ||
    outcome.strand.toLowerCase().includes(lowerQuery)
  );
  
  if (grade) {
    filtered = filtered.filter(outcome => outcome.grade === grade);
  }
  
  return filtered.slice(0, 10);
}

export function getOutcomesByGrade(grade: string): CurriculumOutcome[] {
  return cachedOutcomes.filter(outcome => outcome.grade === grade).slice(0, 20);
}

export function formatOutcomeForDisplay(outcome: CurriculumOutcome): string {
  return `${outcome.outcome}: ${outcome.description}`;
}

function getFallbackOutcomes(): CurriculumOutcome[] {
  return [
    {
      grade: 'K',
      strand: 'Number',
      outcome: 'N.1',
      description: 'Say the number sequence 1 to 10 by 1s, starting anywhere from 1 to 10 and from 10 to 1.',
    },
    {
      grade: '1',
      strand: 'Number',
      outcome: 'N.1',
      description: 'Say the number sequence 0 to 100 by 1s, 2s, 5s and 10s, forward and backward, using starting points that are multiples of 1, 2, 5 and 10 respectively.',
    },
    {
      grade: '2',
      strand: 'Number',
      outcome: 'N.1',
      description: 'Say the number sequence 0 to 100 by 5s, 10s and 2s, forward and backward, using starting points that are multiples of 5, 10 and 2 respectively.',
    },
    {
      grade: '3',
      strand: 'Number',
      outcome: 'N.1',
      description: 'Say the number sequence between any two given numbers forward and backward by 1s, 2s, 5s, 10s, 25s and 100s, using starting points that are multiples.',
    },
    {
      grade: '4',
      strand: 'Number',
      outcome: 'N.1',
      description: 'Represent and describe whole numbers to 10 000, pictorially and symbolically.',
    },
    {
      grade: '5',
      strand: 'Number',
      outcome: 'N.1',
      description: 'Represent and describe whole numbers to 1 000 000.',
    },
  ];
}

