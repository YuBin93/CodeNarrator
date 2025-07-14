import React, { useState, useEffect } from 'react';
import { Camera, Code, Film, GitBranch, Users, Star, Clock, Play, Download, Share2, Sparkles, Brain, Video, MessageCircle, Zap, Target, TrendingUp, CheckCircle, AlertCircle, Loader2, Edit3, RefreshCw, Eye, Save, XCircle, Sliders } from 'lucide-react';

const CodeNarrator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('startup');
  const [generatedScript, setGeneratedScript] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [generatedVideoThumbnailUrl, setGeneratedVideoThumbnailUrl] = useState(null);
  const [error, setError] = useState(null);

  // States for script editing
  const [editingScript, setEditingScript] = useState(false);
  const [tempScript, setTempScript] = useState(null);

  // States for custom options
  const [customDuration, setCustomDuration] = useState(90); // Default 90 seconds
  const [customEmotionalTone, setCustomEmotionalTone] = useState('enthusiastic');
  const [customPacing, setCustomPacing] = useState('dynamic');

  // Defines the steps of the process
  const steps = [
    { id: 'input', title: 'Project Input', icon: GitBranch },
    { id: 'analyze', title: 'AI Analysis', icon: Brain },
    { id: 'extract', title: 'Intent Extraction', icon: Target },
    { id: 'generate', title: 'Script Generation', icon: MessageCircle },
    { id: 'produce', title: 'Video Production', icon: Video }
  ];

  // Defines available narrative templates
  const templates = {
    startup: {
      name: 'Startup Project',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      description: 'Emphasizes innovation and market disruption',
      tone: 'energetic',
      icon: '🚀'
    },
    enterprise: {
      name: 'Enterprise Solution',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      description: 'Focuses on efficiency and professionalism',
      tone: 'professional',
      icon: '🏢'
    },
    opensource: {
      name: 'Open Source Community',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      description: 'Highlights collaboration and sharing',
      tone: 'collaborative',
      icon: '🌍'
    },
    research: {
      name: 'Research Project',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      description: 'Emphasizes academic value and innovation',
      tone: 'academic',
      icon: '🔬'
    }
  };

  // Options for custom emotional tone
  const emotionalToneOptions = [
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'professional', label: 'Professional' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'informative', label: 'Informative' },
  ];

  // Options for custom pacing
  const pacingOptions = [
    { value: 'dynamic', label: 'Dynamic' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'steady', label: 'Steady' },
    { value: 'slow', label: 'Slow' },
  ];

  // Handles the analysis button click event, now calling the backend proxy
  const handleAnalyze = async () => {
    if (!githubUrl) {
      setError("Please enter a GitHub URL.");
      return;
    }

    setError(null); // Clear previous errors
    setIsAnalyzing(true);
    setCurrentStep(1);
    setAnalysisResult(null);
    setGeneratedScript(null);
    setGeneratedVideoThumbnailUrl(null);
    setEditingScript(false);

    try {
      // Call your backend Serverless Function for analysis
      const response = await fetch('/api/analyze-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubUrl,
          customDuration,
          customEmotionalTone,
          customPacing
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform AI analysis via backend.');
      }

      const data = await response.json();
      setAnalysisResult(data.analysisResult);
      setGeneratedScript(data.generatedScript);
      setCurrentStep(4); // Move to Video Production step as both are generated

    } catch (err) {
      console.error("Analysis failed:", err);
      setError(`Analysis failed: ${err.message}. Please check the URL and try again.`);
      setCurrentStep(0); // Reset step on error
      setAnalysisResult(null);
      setGeneratedScript(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handles the video generation button click event, now calling the backend proxy
  const handleGenerateVideo = async () => {
    if (!generatedScript) {
      setError("Please generate a script first before generating video.");
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress(0);
    setGeneratedVideoThumbnailUrl(null);

    try {
      // Simulate progress during image generation
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress <= 100) {
          setVideoProgress(progress);
        } else {
          clearInterval(progressInterval);
        }
      }, 200); // Update every 200ms

      // Call your backend Serverless Function for video thumbnail generation
      const response = await fetch('/api/generate-video-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptTitle: generatedScript.title,
          sceneVisual: generatedScript.scenes[0].visual // Use the first scene's visual for the thumbnail prompt
        })
      });

      const data = await response.json();
      clearInterval(progressInterval); // Clear interval once response is received

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video thumbnail via backend.');
      }

      setGeneratedVideoThumbnailUrl(data.imageUrl);
      setVideoProgress(100); // Ensure progress is 100% on success

    } catch (err) {
      console.error("Video thumbnail generation failed:", err);
      setError(`Video thumbnail generation failed: ${err.message}.`);
      setGeneratedVideoThumbnailUrl(null);
      setVideoProgress(0); // Reset progress on error
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Handles the regenerate script button click event, now calling the backend proxy
  const handleRegenerateScript = async () => {
    if (!analysisResult) {
      setError("Please perform an initial analysis first.");
      return;
    }
    setIsAnalyzing(true);
    setCurrentStep(3);
    setEditingScript(false);

    try {
      // Call your backend Serverless Function for script regeneration
      const response = await fetch('/api/analyze-github', { // Re-use the analyze-github endpoint for regeneration
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubUrl, // Pass the original URL again
          customDuration,
          customEmotionalTone,
          customPacing,
          // You might add a flag here if your backend needs to differentiate between initial analysis and regeneration
          // e.g., isRegenerate: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate script via backend.');
      }

      const data = await response.json();
      setGeneratedScript(data.generatedScript);

    } catch (err) {
      console.error("Script regeneration failed:", err);
      setError(`Script regeneration failed: ${err.message}.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to enter editing mode
  const handleEditScript = () => {
    setEditingScript(true);
    setTempScript({ ...generatedScript }); // Create a copy for editing
  };

  // Function to save edited script
  const handleSaveScript = () => {
    setGeneratedScript(tempScript); // Update the main script with edited content
    setEditingScript(false);
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setTempScript(null); // Clear temporary script
    setEditingScript(false);
  };

  // Function to handle changes in script fields during editing
  const handleChangeScriptField = (field, value) => {
    setTempScript(prev => ({ ...prev, [field]: value }));
  };

  // Video preview component
  const VideoPreview = () => (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50"></div>

      {isGeneratingVideo && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-sm mb-2">Generating video thumbnail...</p>
            <div className="w-48 bg-white/20 rounded-full h-2 mx-auto">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
            <p className="text-xs text-white/60 mt-2">{Math.round(videoProgress)}%</p>
          </div>
        </div>
      )}
      
      {generatedVideoThumbnailUrl && !isGeneratingVideo ? (
        <img 
          src={generatedVideoThumbnailUrl} 
          alt="Generated Video Thumbnail" 
          className="w-full h-full object-cover" 
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/000000/FFFFFF?text=Error+Loading+Image"; }}
        />
      ) : (
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <h3 className="text-xl font-bold mb-2">Technical Trailer Preview</h3>
            <p className="text-white/80">Video script generated based on AI analysis</p>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white text-sm">
          <span>Duration: {generatedScript?.duration}s</span>
          <span>Style: {templates[selectedTemplate].name}</span>
          <span className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </span>
        </div>
      </div>
    </div>
  );

  // AI Confidence Indicator component
  const ConfidenceIndicator = ({ score }) => (
    <div className="flex items-center space-x-2">
      <div className="text-sm text-white/60">AI Confidence</div>
      <div className="flex-1 bg-white/10 rounded-full h-2 max-w-24">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="text-sm font-semibold">{score}%</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CodeNarrator</h1>
                <p className="text-white/60 text-sm">AI-Powered GitHub Project Narration Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <Star className="w-4 h-4" />
                <span>{analysisResult?.stats?.stars || 'N/A'}</span>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-white/10 text-white/40'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : index === currentStep && isAnalyzing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                    index < currentStep ? 'bg-purple-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-white/60">
            {steps.map((step, index) => (
              <div key={step.id} className="text-center">
                <div className={`transition-colors duration-300 ${
                  index <= currentStep ? 'text-white' : 'text-white/40'
                }`}>
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Input Area */}
          <div className="space-y-6">
            {/* GitHub URL Input */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <GitBranch className="w-5 h-5 mr-2" />
                GitHub Project Link
              </h2>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <Code className="absolute right-3 top-3 w-5 h-5 text-white/40" />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!githubUrl || isAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Start AI Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Film className="w-5 h-5 mr-2" />
                Select Narrative Template
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(templates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                      selectedTemplate === key
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.color}`}>
                        <span className="text-lg">{template.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{template.name}</div>
                        <div className="text-sm text-white/60">{template.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customization Options */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Sliders className="w-5 h-5 mr-2" />
                Customization Options
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="duration-slider" className="block text-sm font-medium text-white/70 mb-2">
                    Video Duration: {customDuration}s
                  </label>
                  <input
                    type="range"
                    id="duration-slider"
                    min="30"
                    max="180"
                    step="10"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="emotional-tone" className="block text-sm font-medium text-white/70 mb-2">
                    Emotional Tone
                  </label>
                  <select
                    id="emotional-tone"
                    value={customEmotionalTone}
                    onChange={(e) => setCustomEmotionalTone(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {emotionalToneOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="pacing" className="block text-sm font-medium text-white/70 mb-2">
                    Pacing
                  </label>
                  <select
                    id="pacing"
                    value={customPacing}
                    onChange={(e) => setCustomPacing(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {pacingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Project Statistics */}
            {analysisResult && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Project Statistics
                </h2>
                <div className="mb-4">
                  <ConfidenceIndicator score={analysisResult.confidence_score} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-white/60">Stars</span>
                    </div>
                    <div className="text-xl font-bold mt-1">{analysisResult.stats.stars}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <GitBranch className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white/60">Forks</span>
                    </div>
                    <div className="text-xl font-bold mt-1">{analysisResult.stats.forks}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white/60">Contributors</span>
                    </div>
                    <div className="text-xl font-bold mt-1">{analysisResult.stats.contributors}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-white/60">Last Update</span>
                    </div>
                    <div className="text-sm font-bold mt-1">{analysisResult.stats.lastUpdate}</div>
                  </div>
                </div>
                {analysisResult.stats.readme && (
                  <div className="mt-4">
                    <div className="text-sm text-white/60 mb-1">README Snippet</div>
                    <div className="bg-white/5 rounded-lg p-3 text-sm italic text-white/80">
                      {analysisResult.stats.readme}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Result Area */}
          <div className="space-y-6">
            {/* AI Analysis Result */}
            {analysisResult && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  AI Analysis Result
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-white/60 mb-1">Project Goal</div>
                    <div className="bg-white/5 rounded-lg p-3">{analysisResult.goal}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/60 mb-1">Core Pain Points</div>
                    <div className="bg-white/5 rounded-lg p-3">
                      {analysisResult.pain_points.map((point, index) => (
                        <div key={index} className="flex items-start space-x-2 mb-2 last:mb-0">
                          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-white/60 mb-1">Solution</div>
                    <div className="bg-white/5 rounded-lg p-3">{analysisResult.solution}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/60 mb-1">Tech Stack</div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.tech_stack.map((tech, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Script */}
            {generatedScript && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Generated Video Script
                  </h2>
                  <div className="flex items-center space-x-2">
                    {!editingScript ? (
                      <button
                        onClick={handleEditScript}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm flex items-center space-x-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveScript}
                          className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors text-sm flex items-center space-x-1"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm flex items-center space-x-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleRegenerateScript}
                      disabled={isAnalyzing || editingScript}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm flex items-center space-x-1"
                    >
                      <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {['title', 'hook', 'problem', 'solution', 'demo', 'call_to_action'].map((field) => (
                    <div key={field}>
                      <div className="text-sm text-white/60 mb-1">
                        {field.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </div>
                      {editingScript ? (
                        field === 'title' || field === 'hook' || field === 'call_to_action' ? (
                          <input
                            type="text"
                            value={tempScript[field]}
                            onChange={(e) => handleChangeScriptField(field, e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        ) : (
                          <textarea
                            value={tempScript[field]}
                            onChange={(e) => handleChangeScriptField(field, e.target.value)}
                            rows={field === 'problem' || field === 'solution' ? 3 : 2}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        )
                      ) : (
                        <div className="bg-white/5 rounded-lg p-3">
                          {generatedScript[field]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Preview */}
            {generatedScript && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Video className="w-5 h-5 mr-2" />
                  Video Preview
                </h2>
                <VideoPreview />
                <div className="mt-4 flex space-x-3">
                  <button 
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-green-500/25"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Generate Video</span>
                      </>
                    )}
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeNarrator;
