/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { 
  Activity, Dumbbell, TrendingUp, ArrowRight, User, Target, 
  Scale, Ruler, Calendar, Settings, Bell, Moon, Sun, ArrowLeft,
  Monitor, Check, Flame, Star, Users, Zap, Shield, ChevronRight,
  PlusCircle, History, Save, CheckCircle2, Play, Video, X, Loader2, Sparkles
} from 'lucide-react';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const mockProgressData = [
  { date: '01 Fev', peso: 78.0, carga: 35, volume: 1200 },
  { date: '08 Fev', peso: 77.5, carga: 37.5, volume: 1350 },
  { date: '15 Fev', peso: 77.2, carga: 37.5, volume: 1400 },
  { date: '22 Fev', peso: 76.8, carga: 40, volume: 1550 },
  { date: '01 Mar', peso: 76.5, carga: 40, volume: 1600 },
  { date: '08 Mar', peso: 76.0, carga: 45, volume: 1750 },
  { date: '15 Mar', peso: 75.8, carga: 47.5, volume: 1800 },
  { date: '22 Mar', peso: 75.5, carga: 50, volume: 1850 },
  { date: '29 Mar', peso: 75.0, carga: 55, volume: 2000 },
];

const EXERCISE_DB = [
  // Peito
  { id: 'supino_reto', name: 'Supino Reto com Barra', group: 'Peito', videoThumb: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80' },
  { id: 'supino_inclinado_halteres', name: 'Supino Inclinado com Halteres', group: 'Peito', videoThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },
  { id: 'supino_declinado', name: 'Supino Declinado', group: 'Peito', videoThumb: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80' },
  { id: 'crucifixo_maquina', name: 'Crucifixo na Máquina (Peck Deck)', group: 'Peito', videoThumb: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80' },
  { id: 'crossover_polia', name: 'Crossover na Polia', group: 'Peito', videoThumb: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80' },
  { id: 'flexao_bracos', name: 'Flexão de Braços', group: 'Peito', videoThumb: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80' },
  { id: 'pullover_halter', name: 'Pullover com Halter', group: 'Peito', videoThumb: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80' },
  
  // Costas
  { id: 'puxada_frente', name: 'Puxada na Frente (Pulldown)', group: 'Costas', videoThumb: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=500&q=80' },
  { id: 'barra_fixa', name: 'Barra Fixa', group: 'Costas', videoThumb: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80' },
  { id: 'remada_curvada', name: 'Remada Curvada com Barra', group: 'Costas', videoThumb: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&q=80' },
  { id: 'remada_unilateral', name: 'Remada Unilateral (Serrote)', group: 'Costas', videoThumb: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&q=80' },
  { id: 'levantamento_terra', name: 'Levantamento Terra', group: 'Costas', videoThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },
  { id: 'remada_baixa', name: 'Remada Baixa no Cabo', group: 'Costas', videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },
  { id: 'hiperextensao_lombar', name: 'Hiperextensão Lombar', group: 'Costas', videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },

  // Pernas (Quadríceps, Posteriores, Glúteos, Panturrilhas)
  { id: 'agachamento', name: 'Agachamento Livre', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=500&q=80' },
  { id: 'agachamento_bulgaro', name: 'Agachamento Búlgaro', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=500&q=80' },
  { id: 'leg_press', name: 'Leg Press 45º', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },
  { id: 'avanco_passada', name: 'Avanço / Passada', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },
  { id: 'cadeira_extensora', name: 'Cadeira Extensora', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80' },
  { id: 'mesa_flexora', name: 'Mesa Flexora', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },
  { id: 'stiff', name: 'Stiff com Barra', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },
  { id: 'elevacao_pelvica', name: 'Elevação Pélvica', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80' },
  { id: 'cadeira_abdutora', name: 'Cadeira Abdutora', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80' },
  { id: 'cadeira_adutora', name: 'Cadeira Adutora', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80' },
  { id: 'panturrilha_em_pe', name: 'Panturrilha em Pé', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },
  { id: 'panturrilha_sentado', name: 'Panturrilha Sentado (Máquina)', group: 'Pernas', videoThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },

  // Ombros
  { id: 'desenvolvimento_halteres', name: 'Desenvolvimento com Halteres', group: 'Ombros', videoThumb: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80' },
  { id: 'desenvolvimento_arnold', name: 'Desenvolvimento Arnold', group: 'Ombros', videoThumb: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80' },
  { id: 'elevacao_lateral', name: 'Elevação Lateral com Halteres', group: 'Ombros', videoThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },
  { id: 'elevacao_frontal', name: 'Elevação Frontal na Polia', group: 'Ombros', videoThumb: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&q=80' },
  { id: 'crucifixo_invertido', name: 'Crucifixo Invertido (Máquina)', group: 'Ombros', videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },
  { id: 'remada_alta', name: 'Remada Alta', group: 'Ombros', videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },
  { id: 'encolhimento_ombros', name: 'Encolhimento de Ombros (Trapézio)', group: 'Ombros', videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },

  // Bíceps
  { id: 'rosca_direta_barra', name: 'Rosca Direta com Barra', group: 'Bíceps', videoThumb: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&q=80' },
  { id: 'rosca_alternada', name: 'Rosca Alternada com Halteres', group: 'Bíceps', videoThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },
  { id: 'rosca_martelo', name: 'Rosca Martelo', group: 'Bíceps', videoThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },
  { id: 'rosca_scott', name: 'Rosca Scott (Máquina)', group: 'Bíceps', videoThumb: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80' },
  { id: 'rosca_concentrada', name: 'Rosca Concentrada', group: 'Bíceps', videoThumb: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80' },
  { id: 'rosca_inversa', name: 'Rosca Inversa', group: 'Bíceps', videoThumb: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80' },

  // Tríceps
  { id: 'triceps_polia', name: 'Tríceps na Polia (Corda)', group: 'Tríceps', videoThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },
  { id: 'triceps_testa', name: 'Tríceps Testa com Barra W', group: 'Tríceps', videoThumb: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&q=80' },
  { id: 'triceps_frances', name: 'Tríceps Francês com Halter', group: 'Tríceps', videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },
  { id: 'triceps_banco', name: 'Tríceps no Banco', group: 'Tríceps', videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },
  { id: 'triceps_coice', name: 'Tríceps Coice', group: 'Tríceps', videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },
  { id: 'supino_fechado', name: 'Supino Fechado', group: 'Tríceps', videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },

  // Abdômen e Core
  { id: 'abdominal_crunch', name: 'Abdominal Crunch (Solo)', group: 'Abdômen', videoThumb: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80' },
  { id: 'abdominal_infra', name: 'Abdominal Infra', group: 'Abdômen', videoThumb: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80' },
  { id: 'abdominal_obliquo', name: 'Abdominal Oblíquo', group: 'Abdômen', videoThumb: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80' },
  { id: 'prancha_isometrica', name: 'Prancha Isométrica', group: 'Abdômen', videoThumb: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=500&q=80' },
  { id: 'elevacao_pernas', name: 'Elevação de Pernas Suspenso', group: 'Abdômen', videoThumb: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80' },
  { id: 'russian_twist', name: 'Russian Twist', group: 'Abdômen', videoThumb: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80' },
  { id: 'roda_abdominal', name: 'Roda Abdominal (Ab Wheel)', group: 'Abdômen', videoThumb: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80' },
];

function AIVideoModal({ exercise, onClose }: { exercise: any, onClose: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const generateVideo = async () => {
    try {
      setGenerating(true);
      setError(null);
      setStatus('Verificando chave de API...');
      
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }

      setStatus('Iniciando geração do vídeo (isso pode levar alguns minutos)...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A fitness instructor demonstrating the exercise: ${exercise.name}, clear gym lighting, high quality, full body view, fitness instruction`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        setStatus('Gerando vídeo... Por favor, aguarde.');
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setStatus('Baixando vídeo...');
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.API_KEY || '',
          },
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      } else {
        throw new Error('Não foi possível obter o link do vídeo.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao gerar o vídeo.');
    } finally {
      setGenerating(false);
      setStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Demonstração IA: {exercise.name}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          {videoUrl ? (
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop 
              className="w-full rounded-lg shadow-lg"
            />
          ) : generating ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-zinc-300 font-medium">{status}</p>
              <p className="text-zinc-500 text-sm max-w-md">
                A IA está criando um vídeo exclusivo para este exercício. Este processo pode levar alguns minutos.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Video className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <p className="text-zinc-300 mb-2">
                  Gerar um vídeo demonstrativo usando a inteligência artificial Veo.
                </p>
                <p className="text-zinc-500 text-sm mb-6">
                  Requer uma chave de API do Google Cloud com faturamento ativado.
                </p>
              </div>
              <button 
                onClick={generateVideo}
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                Gerar Vídeo com IA
              </button>
              {error && (
                <p className="text-red-400 text-sm mt-4 max-w-md">{error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg ring-1 ring-emerald-500/20">
            <Dumbbell className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="text-xl font-bold tracking-tight">AI FitCoach</span>
        </div>
        <button onClick={onNext} className="text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer">
          Entrar
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 pt-16 pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl w-full text-center space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-300 mx-auto">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>O Futuro do Fitness chegou</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Treinos que evoluem <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              junto com você
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Eleve o nível dos seus treinos. Nossa IA analisa seu desempenho, prevê seus resultados e sugere ajustes de carga e volume em tempo real para maximizar sua hipertrofia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <motion.button
              onClick={onNext}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 text-zinc-950 px-8 py-4 rounded-full font-bold text-lg transition-colors hover:bg-emerald-400 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] cursor-pointer"
            >
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer border border-zinc-800">
              Ver como funciona
            </button>
          </div>

          {/* Social Proof */}
          <div className="pt-12 flex flex-col items-center gap-4 opacity-80">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden">
                  <User className="w-5 h-5 text-zinc-500" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-500">
                +10k
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span>4.9/5 de usuários ativos</span>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-24 pb-12 w-full text-left"
        >
          <div className="p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800/50 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="font-bold text-zinc-100 text-xl mb-3">Monitoramento Ativo</h3>
            <p className="text-zinc-400 leading-relaxed">
              Detectamos inatividade e enviamos alertas motivacionais personalizados no momento exato para manter sua consistência no topo.
            </p>
          </div>
          
          <div className="p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800/50 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-bold text-zinc-100 text-xl mb-3">Previsão de Resultados</h3>
            <p className="text-zinc-400 leading-relaxed">
              Nossos algoritmos projetam sua evolução física, ganhos de força e mudanças de peso com base no seu histórico único de treinos.
            </p>
          </div>
          
          <div className="p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800/50 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="font-bold text-zinc-100 text-xl mb-3">Sugestões Inteligentes</h3>
            <p className="text-zinc-400 leading-relaxed">
              Receba recomendações diárias. A IA sugere ajustes de volume e carga com base na sua fadiga e performance dos treinos anteriores.
            </p>
          </div>
        </motion.div>
      </main>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-zinc-900/20 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Como Funciona</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Quatro passos simples para transformar seu corpo com a precisão da inteligência artificial.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-8xl font-black text-zinc-800/30 absolute -top-10 -left-4 z-0 pointer-events-none">1</div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 mb-6">
                  <User className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100">Monte sua Rotina</h3>
                <p className="text-zinc-400 leading-relaxed">Cadastre seus exercícios e rotinas preferidas. O aplicativo se adapta perfeitamente ao seu estilo de treino.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative">
              <div className="text-8xl font-black text-zinc-800/30 absolute -top-10 -left-4 z-0 pointer-events-none">2</div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 mb-6">
                  <Dumbbell className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100">Treine e Registre</h3>
                <p className="text-zinc-400 leading-relaxed">Vá para a academia e registre suas cargas, repetições e percepção de esforço diretamente no app.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative">
              <div className="text-8xl font-black text-zinc-800/30 absolute -top-10 -left-4 z-0 pointer-events-none">3</div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 mb-6">
                  <Activity className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100">Análise Inteligente</h3>
                <p className="text-zinc-400 leading-relaxed">A IA processa seus dados instantaneamente, cruzando informações de fadiga, volume e histórico.</p>
              </div>
            </div>
            {/* Step 4 */}
            <div className="relative">
              <div className="text-8xl font-black text-zinc-800/30 absolute -top-10 -left-4 z-0 pointer-events-none">4</div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 mb-6">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100">Evolução Contínua</h3>
                <p className="text-zinc-400 leading-relaxed">Descubra o momento exato de progredir. Receba recomendações precisas de quando aumentar a carga.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What it is / Deep Dive */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-300">
              <Monitor className="w-4 h-4 text-emerald-500" />
              <span>Tecnologia de Ponta</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Muito mais que um <span className="text-emerald-500">app de treinos</span></h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              O AI FitCoach não impõe treinos genéricos. Você monta sua rotina, e ele entende seu histórico, analisa sua fadiga e recomenda o volume ideal para otimizar a hipertrofia e evitar lesões.
            </p>
            <ul className="space-y-6 pt-4">
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-emerald-500/20 p-1 rounded-full">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-100 text-lg">Algoritmos Avançados</h4>
                  <p className="text-zinc-400 mt-1">Treinados com dados de milhares de atletas para encontrar o estímulo perfeito para você.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-emerald-500/20 p-1 rounded-full">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-100 text-lg">Ajustes Baseados em Fadiga</h4>
                  <p className="text-zinc-400 mt-1">Modulação de carga baseada na sua percepção de esforço (RPE) e histórico recente.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-emerald-500/20 p-1 rounded-full">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-100 text-lg">Gráficos Preditivos</h4>
                  <p className="text-zinc-400 mt-1">Visualize exatamente onde você estará em 3 ou 6 meses se mantiver a consistência.</p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Mockup UI */}
          <div className="relative lg:ml-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 blur-3xl rounded-full"></div>
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800/80">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                    <Activity className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Análise de IA</div>
                    <div className="font-bold text-zinc-100 text-lg">Recuperação Ideal</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-sm font-bold border border-emerald-500/20">
                  85%
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Sistema Nervoso Central</span>
                    <span className="text-emerald-500 font-medium">Recuperado</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
                
                <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800/50">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    <span className="text-emerald-400 font-semibold">Recomendação:</span> Seu corpo está pronto para progressão de carga. Aumentamos a carga alvo do <strong>Agachamento Livre</strong> em 2.5kg para o treino de hoje.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating Element */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-6 -left-6 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xl flex items-center gap-4 hidden sm:flex"
            >
              <div className="bg-blue-500/20 p-2 rounded-full">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-xs text-zinc-400">Previsão de Força</div>
                <div className="font-bold text-zinc-100">+12% em 4 semanas</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-zinc-900/40 border-t border-zinc-800/50 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 max-w-md h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
        
        <div className="max-w-3xl mx-auto px-6 space-y-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Pronto para sua <span className="text-emerald-500">melhor versão?</span></h2>
          <p className="text-xl text-zinc-400">Junte-se a milhares de pessoas que já transformaram seus corpos com o AI FitCoach.</p>
          <div className="pt-4">
            <motion.button
              onClick={onNext}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-zinc-950 px-10 py-5 rounded-full font-bold text-xl transition-colors hover:bg-emerald-400 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] cursor-pointer"
            >
              Começar Minha Jornada
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileScreen({ onNext }: { onNext: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    goal: 'hipertrofia',
    experience: 'iniciante'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full bg-zinc-900/80 border border-zinc-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Configure seu Perfil</h2>
          <p className="text-zinc-400">Precisamos de alguns dados para personalizar seu treino.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" /> Nome
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              placeholder="Como quer ser chamado?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Idade */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" /> Idade
              </label>
              <input
                type="number"
                required
                min="14"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="Anos"
              />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-500" /> Peso (kg)
              </label>
              <input
                type="number"
                required
                step="0.1"
                min="30"
                max="300"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="Ex: 75.5"
              />
            </div>

            {/* Altura */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-emerald-500" /> Altura (cm)
              </label>
              <input
                type="number"
                required
                min="100"
                max="250"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="Ex: 175"
              />
            </div>
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" /> Objetivo Principal
            </label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
            >
              <option value="hipertrofia">Ganho de Massa Muscular (Hipertrofia)</option>
              <option value="emagrecimento">Perda de Gordura (Emagrecimento)</option>
              <option value="manutencao">Manutenção e Saúde Geral</option>
              <option value="forca">Ganho de Força</option>
            </select>
          </div>

          {/* Experiência */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Nível de Experiência
            </label>
            <select
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
            >
              <option value="iniciante">Iniciante (Nunca treinou ou parou há muito tempo)</option>
              <option value="intermediario">Intermediário (Treina consistentemente há 6+ meses)</option>
              <option value="avancado">Avançado (Treina consistentemente há 2+ anos)</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-zinc-950 px-8 py-4 rounded-xl font-bold text-lg transition-colors hover:bg-emerald-400 mt-4 cursor-pointer"
          >
            Gerar Meu Treino
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

function DashboardScreen({ onNavigate }: { onNavigate: (step: 'settings') => void }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [restTime, setRestTime] = useState('');
  const [notes, setNotes] = useState('');
  const [videoModalExercise, setVideoModalExercise] = useState<any>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [recentLogs, setRecentLogs] = useState([
    { id: 1, exercise: 'Supino Reto com Barra', sets: 4, reps: 10, weight: 60, restTime: 90, time: '2 horas atrás', notes: 'Senti o ombro esquerdo um pouco.' },
    { id: 2, exercise: 'Agachamento Livre', sets: 4, reps: 8, weight: 100, restTime: 120, time: 'Ontem', notes: '' },
  ]);

  const selectedExercise = EXERCISE_DB.find(e => e.id === selectedExerciseId);

  const handleLogWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise || !sets || !reps || !weight) return;
    
    setIsLogging(true);
    setTimeout(() => {
      const newLog = {
        id: Date.now(),
        exercise: selectedExercise.name,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight),
        restTime: restTime ? parseInt(restTime) : undefined,
        notes,
        time: 'Agora mesmo'
      };
      setRecentLogs([newLog, ...recentLogs].slice(0, 4));
      setSelectedExerciseId('');
      setSets('');
      setReps('');
      setWeight('');
      setRestTime('');
      setNotes('');
      setIsLogging(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans">
      <header className="flex justify-between items-center w-full px-8 py-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg ring-1 ring-emerald-500/20">
            <Dumbbell className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="text-xl font-bold tracking-tight">AI FitCoach</span>
        </div>
        <button 
          onClick={() => onNavigate('settings')} 
          className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer border border-zinc-800"
        >
          <Settings className="w-5 h-5 text-zinc-400" />
        </button>
      </header>
      
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Visão Geral</h1>
            <p className="text-zinc-400">Acompanhe sua evolução e previsões geradas pela IA.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Scale className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-medium">Peso Atual</p>
                  <h3 className="text-2xl font-bold">75.0 kg</h3>
                </div>
              </div>
              <p className="text-sm text-emerald-400 flex items-center gap-1 font-medium">
                <TrendingUp className="w-4 h-4" /> -1.5kg este mês
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Dumbbell className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-medium">Carga Média</p>
                  <h3 className="text-2xl font-bold">55 kg</h3>
                </div>
              </div>
              <p className="text-sm text-emerald-400 flex items-center gap-1 font-medium">
                <TrendingUp className="w-4 h-4" /> +15kg este mês
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-medium">Consistência</p>
                  <h3 className="text-2xl font-bold">85%</h3>
                </div>
              </div>
              <p className="text-sm text-zinc-400 flex items-center gap-1 font-medium">
                4 treinos por semana
              </p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                Evolução: Peso vs. Carga
              </h3>
            </div>
            
            <div 
              className="h-[400px] w-full relative"
              role="region"
              aria-label="Gráfico interativo mostrando a evolução do peso corporal e da carga média ao longo do tempo."
            >
              {/* Screen reader only data table for accessibility */}
              <div className="sr-only" aria-live="polite">
                <p>Tabela de dados do gráfico de evolução:</p>
                <ul>
                  {mockProgressData.map((data, index) => (
                    <li key={index}>
                      Data: {data.date}. Peso Corporal: {data.peso} kg. Carga Média: {data.carga} kg.
                    </li>
                  ))}
                </ul>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={mockProgressData} 
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  accessibilityLayer
                  role="img"
                  aria-label="Gráfico de área comparando peso e carga"
                >
                  <defs>
                    <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCarga" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} aria-hidden="true" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#a1a1aa" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                    aria-label="Eixo X: Datas das medições"
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#a1a1aa" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={['dataMin - 2', 'dataMax + 2']} 
                    dx={-10}
                    aria-label="Eixo Y Esquerdo: Peso Corporal em quilogramas"
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#a1a1aa" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={['dataMin - 5', 'dataMax + 5']} 
                    dx={10}
                    aria-label="Eixo Y Direito: Carga Média em quilogramas"
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      borderColor: '#27272a', 
                      borderRadius: '16px', 
                      color: '#f4f4f5',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ fontWeight: 500 }}
                    aria-label="Detalhes do ponto de dados selecionado"
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} aria-label="Legenda do gráfico" />
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="peso" 
                    name="Peso Corporal (kg)" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPeso)"
                    aria-label="Área de Peso Corporal"
                  />
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="carga" 
                    name="Carga Média (kg)" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCarga)"
                    aria-label="Área de Carga Média"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workout Log Section */}
          <div className="bg-zinc-900/80 border border-emerald-500/20 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_-15px_rgba(16,185,129,0.15)] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-500" />
                Registro Manual de Treino
              </h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Form */}
              <div className="lg:col-span-3">
                <form onSubmit={handleLogWorkout} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Exercício</label>
                    <select
                      required
                      value={selectedExerciseId}
                      onChange={(e) => setSelectedExerciseId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                    >
                      <option value="" disabled>Selecione um exercício...</option>
                      {EXERCISE_DB.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.name} ({ex.group})</option>
                      ))}
                    </select>
                  </div>

                  {/* AI Video Preview */}
                  {selectedExercise && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="relative rounded-xl overflow-hidden border border-zinc-800 group cursor-pointer"
                      onClick={() => setVideoModalExercise(selectedExercise)}
                    >
                      <div className="absolute top-2 left-2 z-10 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-2 py-1 rounded-md flex items-center gap-1.5">
                        <Video className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Vídeo Gerado por IA</span>
                      </div>
                      <img 
                        src={selectedExercise.videoThumb} 
                        alt={`Demonstração de ${selectedExercise.name}`}
                        className="w-full h-32 object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-emerald-500/90 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-zinc-950 ml-1" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Séries</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={sets}
                        onChange={(e) => setSets(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Ex: 4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Reps</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Ex: 10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Carga (kg)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.5"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Ex: 60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Descanso (s)</label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={restTime}
                        onChange={(e) => setRestTime(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Ex: 90"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Observações (Opcional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-20"
                      placeholder="Como foi o treino? Alguma adaptação ou dor?"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLogging}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/50 px-6 py-3 rounded-xl font-bold transition-colors hover:bg-emerald-500 hover:text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLogging ? (
                      <Activity className="w-5 h-5 animate-pulse" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" /> Registrar Exercício
                      </>
                    )}
                  </motion.button>
                </form>
              </div>

              {/* Recent Logs */}
              <div className="lg:col-span-2 bg-zinc-950/50 rounded-2xl p-5 border border-zinc-800/50">
                <h4 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" /> Últimos Registros
                </h4>
                <div className="space-y-3">
                  {recentLogs.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-4">Nenhum treino registrado ainda.</p>
                  ) : (
                    recentLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800/80">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-zinc-200 text-sm">{log.exercise}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {log.sets}x{log.reps} • {log.weight}kg
                              {log.restTime && ` • ${log.restTime}s descanso`}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
                            <span className="text-[10px] text-zinc-600">{log.time}</span>
                          </div>
                        </div>
                        {log.notes && (
                          <p className="text-xs text-zinc-400 mt-2 italic border-l-2 border-zinc-700 pl-2">{log.notes}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      {videoModalExercise && (
        <AIVideoModal 
          exercise={videoModalExercise} 
          onClose={() => setVideoModalExercise(null)}
        />
      )}
    </div>
  );
}

function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState({
    name: 'João Silva',
    age: '25',
    weight: '75',
    height: '175',
    goal: 'hipertrofia',
    experience: 'intermediario',
    units: 'metric', // 'metric' | 'imperial'
    notifications: true,
    theme: 'dark' // 'dark' | 'light' | 'system'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Voltar ao Painel
        </button>
        
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Configurações</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-zinc-900 text-emerald-500 border border-zinc-800' 
                  : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Perfil do Usuário</span>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left cursor-pointer ${
                activeTab === 'preferences' 
                  ? 'bg-zinc-900 text-emerald-500 border border-zinc-800' 
                  : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Preferências do App</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <form onSubmit={handleSave}>
              
              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6 border-b border-zinc-800 pb-4">Informações Pessoais</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Idade</label>
                      <input
                        type="number"
                        value={settings.age}
                        onChange={(e) => setSettings({ ...settings, age: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Peso ({settings.units === 'metric' ? 'kg' : 'lbs'})
                      </label>
                      <input
                        type="number"
                        value={settings.weight}
                        onChange={(e) => setSettings({ ...settings, weight: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Altura ({settings.units === 'metric' ? 'cm' : 'in'})
                      </label>
                      <input
                        type="number"
                        value={settings.height}
                        onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Objetivo</label>
                    <select
                      value={settings.goal}
                      onChange={(e) => setSettings({ ...settings, goal: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                    >
                      <option value="hipertrofia">Ganho de Massa Muscular</option>
                      <option value="emagrecimento">Perda de Gordura</option>
                      <option value="manutencao">Manutenção</option>
                      <option value="forca">Ganho de Força</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Experiência</label>
                    <select
                      value={settings.experience}
                      onChange={(e) => setSettings({ ...settings, experience: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                    >
                      <option value="iniciante">Iniciante</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <h2 className="text-xl font-semibold mb-6 border-b border-zinc-800 pb-4">Preferências do App</h2>
                  
                  {/* Units Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-zinc-200 flex items-center gap-2">
                        <Scale className="w-4 h-4 text-emerald-500" /> Sistema de Medidas
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">Escolha entre sistema métrico ou imperial.</p>
                    </div>
                    <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, units: 'metric' })}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                          settings.units === 'metric' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Métrico
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, units: 'imperial' })}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                          settings.units === 'imperial' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Imperial
                      </button>
                    </div>
                  </div>

                  {/* Notifications Toggle */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                    <div>
                      <h3 className="font-medium text-zinc-200 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-500" /> Notificações Inteligentes
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">Receba alertas de inatividade e reforços positivos.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        settings.notifications ? 'bg-emerald-500' : 'bg-zinc-700'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Theme Selection */}
                  <div className="pt-4 border-t border-zinc-800/50">
                    <h3 className="font-medium text-zinc-200 mb-4">Tema do Aplicativo</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, theme: 'light' })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
                          settings.theme === 'light' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                        }`}
                      >
                        <Sun className={`w-6 h-6 ${settings.theme === 'light' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                        <span className="text-sm font-medium">Claro</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, theme: 'dark' })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
                          settings.theme === 'dark' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                        }`}
                      >
                        <Moon className={`w-6 h-6 ${settings.theme === 'dark' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                        <span className="text-sm font-medium">Escuro</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, theme: 'system' })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
                          settings.theme === 'system' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                        }`}
                      >
                        <Monitor className={`w-6 h-6 ${settings.theme === 'system' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                        <span className="text-sm font-medium">Sistema</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 bg-emerald-500 text-zinc-950 px-6 py-3 rounded-xl font-bold transition-colors hover:bg-emerald-400 cursor-pointer"
                >
                  {saved ? (
                    <>
                      <Check className="w-5 h-5" /> Salvo!
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState<'welcome' | 'profile' | 'dashboard' | 'settings'>('welcome');

  return (
    <>
      {step === 'welcome' && <WelcomeScreen onNext={() => setStep('profile')} />}
      {step === 'profile' && <ProfileScreen onNext={() => setStep('dashboard')} />}
      {step === 'dashboard' && <DashboardScreen onNavigate={setStep} />}
      {step === 'settings' && <SettingsScreen onBack={() => setStep('dashboard')} />}
    </>
  );
}
