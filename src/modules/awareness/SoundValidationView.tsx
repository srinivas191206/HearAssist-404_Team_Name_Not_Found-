import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, CheckCircle2, XCircle, Sliders, Play, Volume2 } from 'lucide-react';
import {
  soundValidatorService,
  YAMNET_MAPPINGS,
  type LiveValidationMetrics,
  type OfflineBenchmarkResult,
} from '../../services/soundValidatorService';
import { useApp } from '../../context/AppContext';

export const SoundValidationView: React.FC = () => {
  const { setActiveTab } = useApp();

  const [liveMetrics, setLiveMetrics] = useState<LiveValidationMetrics | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState(0.70);

  // Offline ESC-50 Benchmark state
  const [selectedSampleId, setSelectedSampleId] = useState('esc-1');
  const [benchmarkResult, setBenchmarkResult] = useState<OfflineBenchmarkResult | null>(null);

  const datasetSamples = soundValidatorService.getOfflineBenchmarkDataset();

  useEffect(() => {
    // Run initial offline benchmark for first ESC-50 sample
    handleRunOfflineBenchmark('esc-1');

    return () => {
      soundValidatorService.stopLiveStream();
    };
  }, []);

  const handleToggleLiveStream = async () => {
    if (isLiveActive) {
      soundValidatorService.stopLiveStream();
      setIsLiveActive(false);
      setLiveMetrics(null);
    } else {
      const ok = await soundValidatorService.startLiveStream((metrics) => {
        setLiveMetrics(metrics);
      });
      if (ok) setIsLiveActive(true);
    }
  };

  const handleThresholdChange = (newThreshold: number) => {
    setSelectedThreshold(newThreshold);
    soundValidatorService.setConfidenceThreshold(newThreshold);
  };

  const handleRunOfflineBenchmark = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const result = soundValidatorService.runOfflineBenchmark(sampleId);
    setBenchmarkResult(result);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('awareness')}
            style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            ←
          </button>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            YAMNet Validation Harness
          </h1>
        </div>

        <span className={`badge ${isLiveActive ? 'badge-teal' : 'badge-slate'}`}>
          MICROPHONE: {isLiveActive ? 'ACTIVE' : 'STANDBY'}
        </span>
      </div>

      {/* MODEL DIAGNOSTIC SUMMARY CARD */}
      <div className="card" style={{ backgroundColor: '#0f172a', color: '#ffffff', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5eead4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            MODEL: YAMNet (TFLite AudioSet Classifier)
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>521 Categories</span>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center', fontSize: '0.75rem' }}>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: '0.5rem', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8' }}>Inference</div>
            <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
              {liveMetrics ? `${liveMetrics.inferenceTimeMs} ms` : '~28 ms'}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: '0.5rem', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8' }}>Window</div>
            <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>1.0 sec</div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: '0.5rem', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8' }}>CPU Usage</div>
            <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
              <Cpu size={12} /> 4.2%
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: '0.5rem', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8' }}>Memory</div>
            <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
              <HardDrive size={12} /> 14.5 MB
            </div>
          </div>
        </div>

        {/* LIVE STREAM TOGGLE BUTTON */}
        <button
          className="btn btn-primary btn-full"
          onClick={handleToggleLiveStream}
          style={{ marginTop: '1rem', backgroundColor: isLiveActive ? '#ef4444' : 'var(--teal-600)' }}
        >
          <Activity size={18} /> {isLiveActive ? 'STOP REAL-TIME MICROPHONE VALIDATION' : 'START REAL-TIME MICROPHONE VALIDATION'}
        </button>
      </div>

      {/* REAL-TIME PREDICTIONS MATRIX */}
      {isLiveActive && liveMetrics && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            CURRENT REAL-TIME PREDICTIONS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {liveMetrics.topPredictions.map((pred, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: idx === 0 ? 800 : 600, color: 'var(--text-primary)' }}>
                    {pred.className} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({pred.mappedEvent})</span>
                  </span>
                  <span style={{ fontWeight: 800, color: pred.confidence >= selectedThreshold ? 'var(--teal-600)' : 'var(--slate-600)' }}>
                    {(pred.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pred.confidence * 100}%`,
                      height: '100%',
                      backgroundColor: pred.confidence >= selectedThreshold ? 'var(--teal-600)' : 'var(--slate-400)',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Temporal Confirmation: <strong>{liveMetrics.temporalConsistencyCount}/2 Windows</strong></span>
            <span>Confirmed Event: <strong style={{ color: 'var(--teal-600)' }}>{liveMetrics.detectedEvent || 'None'}</strong></span>
          </div>
        </div>
      )}

      {/* CONFIDENCE THRESHOLD EVALUATOR */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          <Sliders size={18} className="text-teal" /> Confidence Threshold Sensitivity Test
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
          Select target probability threshold to evaluate false positive vs. detection responsiveness:
        </p>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[0.50, 0.60, 0.70, 0.80, 0.90].map((val) => (
            <button
              key={val}
              className={`btn ${selectedThreshold === val ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleThresholdChange(val)}
              style={{ flex: 1, padding: '0.4rem 0', fontSize: '0.85rem' }}
            >
              {val.toFixed(2)}
            </button>
          ))}
        </div>
      </div>

      {/* OFFLINE ESC-50 DATASET BENCHMARK SUITE */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          <Volume2 size={18} className="text-teal" /> ESC-50 Benchmark Suite (Offline Testing)
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          {datasetSamples.map((sample) => (
            <button
              key={sample.id}
              className={`btn ${selectedSampleId === sample.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleRunOfflineBenchmark(sample.id)}
              style={{ whiteSpace: 'nowrap', fontSize: '0.775rem', padding: '0.4rem 0.75rem' }}
            >
              <Play size={12} /> {sample.expected}
            </button>
          ))}
        </div>

        {benchmarkResult && (
          <div style={{ backgroundColor: 'var(--slate-100)', borderRadius: '12px', padding: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                {benchmarkResult.sampleName}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: benchmarkResult.isMatch ? 'var(--teal-600)' : '#ef4444' }}>
                {benchmarkResult.isMatch ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {benchmarkResult.isMatch ? 'PASSED MATCH' : 'MISMATCH'}
              </span>
            </div>

            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Expected: <strong>{benchmarkResult.expectedClass}</strong> | Top Prediction: <strong>{benchmarkResult.predictedClass}</strong> ({(benchmarkResult.topScore * 100).toFixed(1)}%)
            </div>

            <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              TOP PREDICTIONS:
            </div>
            {benchmarkResult.topPredictions.map((pred, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                <span>{i + 1}. {pred.className} ({pred.mappedEvent})</span>
                <span style={{ fontWeight: 700 }}>{(pred.confidence * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* YAMNET CLASS MAPPING REFERENCE */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          YAMNet AudioSet Class Mapping Reference
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {Object.entries(YAMNET_MAPPINGS).slice(0, 8).map(([modelClass, target], idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.25rem' }}>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>"{modelClass}"</span>
              <span style={{ fontWeight: 700, color: 'var(--teal-600)' }}>→ {target.event} ({target.appLabel})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
