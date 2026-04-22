import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Plus, Trash2, Edit3, Users, Calendar, Paperclip, MessageCircle,
  Download, Upload, Moon, Sun, Search, Filter, BarChart3,
  CheckCircle2, Clock, AlertCircle, Flag, ChevronRight, ChevronDown,
  X, Save, FileText, Image, Link2, Target, Zap, TrendingUp,
  User, Shield, Eye, Settings, Home, Network, GitBranch, Layout,
  PlayCircle, PauseCircle, MoreVertical, Share2, Bell, Hash,
  Layers, Maximize2, Minimize2, RotateCcw, Copy,
  FolderOpen, FolderPlus, ArrowLeft, Briefcase, Sparkles
} from 'lucide-react';

export default function MindMapAgency() {
  // ============ ESTADO PRINCIPAL ============
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState('map'); // map | gantt | dashboard | team
  const [layoutStyle, setLayoutStyle] = useState('radial'); // radial | tree | fishbone | flow
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sidePanel, setSidePanel] = useState(null); // null | 'task' | 'team' | 'files'
  const [team, setTeam] = useState([]);
  const [filterPerson, setFilterPerson] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showHome, setShowHome] = useState(true); // começa sempre na tela inicial
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // saving | saved
  const [notifications, setNotifications] = useState([]);

  const canvasRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // ============ PERSISTÊNCIA (localStorage) ============
  useEffect(() => {
    function loadData() {
      try {
        const raw = localStorage.getItem('mindmap:projects');
        if (raw) {
          const data = JSON.parse(raw);
          setProjects(data.projects || []);
          setTeam(data.team || []);
          setDarkMode(data.darkMode !== false);
          // Não carrega projeto automaticamente — fica na tela inicial
        } else {
          initializeDemo();
        }
      } catch (e) {
        initializeDemo();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Carrega nós do projeto quando um é selecionado
  useEffect(() => {
    if (!currentProjectId) {
      setNodes([]);
      return;
    }
    try {
      const projectRaw = localStorage.getItem(`mindmap:project:${currentProjectId}`);
      if (projectRaw) {
        const projectData = JSON.parse(projectRaw);
        setNodes(projectData.nodes || []);
        setLayoutStyle(projectData.layoutStyle || 'radial');
      }
    } catch (e) {
      console.error('Erro ao carregar projeto:', e);
    }
  }, [currentProjectId]);

  const initializeDemo = () => {
    const demoTeam = [
      { id: 't1', name: 'Ana Silva', role: 'Diretora Criativa', color: '#ec4899', avatar: 'AS', access: 'admin' },
      { id: 't2', name: 'Carlos Mendes', role: 'Designer', color: '#8b5cf6', avatar: 'CM', access: 'editor' },
      { id: 't3', name: 'Beatriz Lima', role: 'Social Media', color: '#06b6d4', avatar: 'BL', access: 'editor' },
      { id: 't4', name: 'Diego Santos', role: 'Desenvolvedor', color: '#f59e0b', avatar: 'DS', access: 'editor' },
    ];
    const projectId = 'proj_' + Date.now();
    const demoProject = {
      id: projectId,
      name: 'Projetos da Agência (Exemplo)',
      description: 'Visão geral dos projetos em andamento — use este como modelo',
      color: '#6366f1',
      icon: 'briefcase',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const rootId = 'node_root';
    const demoNodes = [
      {
        id: rootId, parentId: null, title: 'Agência — Q2 2026',
        description: 'Hub central de todos os projetos', x: 0, y: 0,
        color: '#6366f1', icon: 'target', shape: 'hexagon', size: 'large',
        tasks: [], attachments: [], comments: [], progress: 0,
        manualProgress: null, expanded: true,
      },
      {
        id: 'node_1', parentId: rootId, title: 'Campanha Lançamento',
        description: 'Campanha de lançamento do novo produto do cliente',
        x: -320, y: -180, color: '#ec4899', icon: 'zap', shape: 'rounded', size: 'medium',
        tasks: [
          { id: 'tk1', title: 'Briefing com cliente', status: 'done', priority: 'high', assignees: ['t1'], startDate: '2026-04-10', dueDate: '2026-04-15', effort: 8, description: 'Reunião inicial' },
          { id: 'tk2', title: 'Conceito criativo', status: 'doing', priority: 'critical', assignees: ['t1', 't2'], startDate: '2026-04-16', dueDate: '2026-04-25', effort: 24, description: 'Desenvolver conceito visual' },
        ],
        attachments: [], comments: [], progress: 0, manualProgress: null, expanded: true,
      },
      {
        id: 'node_2', parentId: rootId, title: 'Social Media',
        description: 'Gestão de redes sociais dos clientes',
        x: 320, y: -180, color: '#06b6d4', icon: 'hash', shape: 'rounded', size: 'medium',
        tasks: [
          { id: 'tk3', title: 'Calendário editorial Maio', status: 'todo', priority: 'medium', assignees: ['t3'], startDate: '2026-04-20', dueDate: '2026-04-28', effort: 12, description: 'Planejar posts' },
        ],
        attachments: [], comments: [], progress: 0, manualProgress: null, expanded: true,
      },
      {
        id: 'node_3', parentId: rootId, title: 'Site Institucional',
        description: 'Desenvolvimento do novo site',
        x: -320, y: 180, color: '#f59e0b', icon: 'layout', shape: 'rounded', size: 'medium',
        tasks: [
          { id: 'tk4', title: 'Wireframes', status: 'review', priority: 'high', assignees: ['t2', 't4'], startDate: '2026-04-12', dueDate: '2026-04-22', effort: 16, description: 'Criar wireframes' },
          { id: 'tk5', title: 'Desenvolvimento front-end', status: 'todo', priority: 'high', assignees: ['t4'], startDate: '2026-04-25', dueDate: '2026-05-15', effort: 80, description: 'Implementar front' },
        ],
        attachments: [], comments: [], progress: 0, manualProgress: null, expanded: true,
      },
      {
        id: 'node_4', parentId: rootId, title: 'Processos Internos',
        description: 'Otimização de processos da agência',
        x: 320, y: 180, color: '#10b981', icon: 'settings', shape: 'rounded', size: 'medium',
        tasks: [
          { id: 'tk6', title: 'Documentar fluxo de briefing', status: 'doing', priority: 'medium', assignees: ['t1'], startDate: '2026-04-15', dueDate: '2026-04-30', effort: 10, description: 'SOP completo' },
        ],
        attachments: [], comments: [], progress: 0, manualProgress: null, expanded: true,
      },
    ];
    setTeam(demoTeam);
    setProjects([demoProject]);
    // Salva os nós do projeto demo no localStorage (mas não abre)
    localStorage.setItem(`mindmap:project:${projectId}`, JSON.stringify({
      nodes: demoNodes,
      layoutStyle: 'radial',
    }));
  };

  // ============ GERENCIAR PROJETOS ============
  const createProject = (name, description, color, icon) => {
    const projectId = 'proj_' + Date.now();
    const rootId = 'node_root_' + Date.now();
    const newProject = {
      id: projectId,
      name: name || 'Novo Mapa',
      description: description || '',
      color: color || '#6366f1',
      icon: icon || 'briefcase',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const rootNode = {
      id: rootId, parentId: null, title: name || 'Novo Mapa',
      description: description || '', x: 0, y: 0,
      color: color || '#6366f1', icon: icon || 'target', shape: 'hexagon', size: 'large',
      tasks: [], attachments: [], comments: [], progress: 0,
      manualProgress: null, expanded: true,
    };
    localStorage.setItem(`mindmap:project:${projectId}`, JSON.stringify({
      nodes: [rootNode], layoutStyle: 'radial',
    }));
    setProjects([...projects, newProject]);
    setCurrentProjectId(projectId);
    setShowHome(false);
    return projectId;
  };

  const openProject = (projectId) => {
    setCurrentProjectId(projectId);
    setShowHome(false);
    setCurrentView('map');
    setSelectedNodeId(null);
    setSidePanel(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const backToHome = () => {
    setShowHome(true);
    setCurrentProjectId(null);
    setSelectedNodeId(null);
    setSidePanel(null);
  };

  const renameProject = (projectId, newName, newDescription, newColor, newIcon) => {
    setProjects(projects.map(p =>
      p.id === projectId
        ? { ...p, name: newName, description: newDescription, color: newColor, icon: newIcon, updatedAt: Date.now() }
        : p
    ));
  };

  const duplicateProject = (projectId) => {
    const original = projects.find(p => p.id === projectId);
    if (!original) return;
    const newProjectId = 'proj_' + Date.now();
    const newProject = {
      ...original,
      id: newProjectId,
      name: original.name + ' (Cópia)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    // Copia os nós
    try {
      const raw = localStorage.getItem(`mindmap:project:${projectId}`);
      if (raw) {
        localStorage.setItem(`mindmap:project:${newProjectId}`, raw);
      }
    } catch (e) {}
    setProjects([...projects, newProject]);
  };

  const deleteProject = (projectId) => {
    if (!confirm('Tem certeza que deseja excluir este mapa? Essa ação não pode ser desfeita.')) return;
    try {
      localStorage.removeItem(`mindmap:project:${projectId}`);
    } catch (e) {}
    setProjects(projects.filter(p => p.id !== projectId));
    if (currentProjectId === projectId) {
      backToHome();
    }
  };

  // Auto-save com debounce (localStorage)
  useEffect(() => {
    if (loading) return;
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        // Atualiza o updatedAt do projeto atual se houver mudança nos nós
        let projectsToSave = projects;
        if (currentProjectId && nodes.length > 0) {
          projectsToSave = projects.map(p =>
            p.id === currentProjectId ? { ...p, updatedAt: Date.now() } : p
          );
        }
        localStorage.setItem('mindmap:projects', JSON.stringify({
          projects: projectsToSave, team, darkMode, currentProjectId,
        }));
        if (currentProjectId && nodes.length > 0) {
          localStorage.setItem(`mindmap:project:${currentProjectId}`, JSON.stringify({
            nodes, layoutStyle,
          }));
        }
        setSaveStatus('saved');
      } catch (e) {
        console.error('Erro ao salvar:', e);
        setSaveStatus('saved');
      }
    }, 800);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [nodes, projects, team, darkMode, currentProjectId, layoutStyle, loading]);

  // ============ CÁLCULO DE PROGRESSO ============
  const computeProgress = useCallback((nodeId, nodeList) => {
    const node = nodeList.find(n => n.id === nodeId);
    if (!node) return 0;
    if (node.manualProgress !== null && node.manualProgress !== undefined) return node.manualProgress;

    const children = nodeList.filter(n => n.parentId === nodeId);
    const ownTasks = node.tasks || [];

    if (children.length === 0 && ownTasks.length === 0) return 0;

    let totalItems = 0, completedItems = 0;
    ownTasks.forEach(t => {
      totalItems++;
      if (t.status === 'done') completedItems++;
    });
    children.forEach(child => {
      const childProgress = computeProgress(child.id, nodeList);
      totalItems++;
      completedItems += childProgress / 100;
    });
    return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  }, []);

  const nodesWithProgress = useMemo(() => {
    return nodes.map(n => ({ ...n, progress: computeProgress(n.id, nodes) }));
  }, [nodes, computeProgress]);

  // ============ ESTATÍSTICAS ============
  const stats = useMemo(() => {
    const allTasks = nodes.flatMap(n => (n.tasks || []).map(t => ({ ...t, nodeId: n.id })));
    const today = new Date().toISOString().split('T')[0];
    return {
      total: allTasks.length,
      done: allTasks.filter(t => t.status === 'done').length,
      doing: allTasks.filter(t => t.status === 'doing').length,
      todo: allTasks.filter(t => t.status === 'todo').length,
      review: allTasks.filter(t => t.status === 'review').length,
      overdue: allTasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < today).length,
      byPerson: team.map(p => ({
        ...p,
        count: allTasks.filter(t => t.assignees?.includes(p.id)).length,
        done: allTasks.filter(t => t.assignees?.includes(p.id) && t.status === 'done').length,
      })),
      allTasks,
    };
  }, [nodes, team]);

  // ============ LAYOUT AUTOMÁTICO ============
  const applyLayout = (style) => {
    const root = nodes.find(n => n.parentId === null);
    if (!root) return;
    const newNodes = [...nodes];
    const setPos = (id, x, y) => {
      const idx = newNodes.findIndex(n => n.id === id);
      if (idx >= 0) newNodes[idx] = { ...newNodes[idx], x, y };
    };

    const positionRadial = (parentId, px, py, angleStart, angleEnd, depth) => {
      const children = newNodes.filter(n => n.parentId === parentId);
      if (children.length === 0) return;
      const radius = 220 + depth * 40;
      children.forEach((child, i) => {
        const angle = angleStart + (angleEnd - angleStart) * ((i + 0.5) / children.length);
        const x = px + radius * Math.cos(angle);
        const y = py + radius * Math.sin(angle);
        setPos(child.id, x, y);
        const spread = (angleEnd - angleStart) / children.length;
        positionRadial(child.id, x, y, angle - spread / 2, angle + spread / 2, depth + 1);
      });
    };

    const positionTree = (parentId, px, py, depth, siblingIdx, totalSiblings) => {
      const children = newNodes.filter(n => n.parentId === parentId);
      if (children.length === 0) return;
      const spacing = 220;
      const startX = px - ((children.length - 1) * spacing) / 2;
      children.forEach((child, i) => {
        const x = startX + i * spacing;
        const y = py + 180;
        setPos(child.id, x, y);
        positionTree(child.id, x, y, depth + 1, i, children.length);
      });
    };

    const positionFishbone = (parentId, px, py) => {
      const children = newNodes.filter(n => n.parentId === parentId);
      children.forEach((child, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const offset = Math.floor(i / 2) * 180 + 120;
        const x = px + offset;
        const y = py + side * 180;
        setPos(child.id, x, y);
        positionFishbone(child.id, x, y);
      });
    };

    const positionFlow = (parentId, px, py, depth) => {
      const children = newNodes.filter(n => n.parentId === parentId);
      children.forEach((child, i) => {
        const x = px + 280;
        const y = py + (i - (children.length - 1) / 2) * 160;
        setPos(child.id, x, y);
        positionFlow(child.id, x, y, depth + 1);
      });
    };

    setPos(root.id, 0, 0);
    if (style === 'radial') positionRadial(root.id, 0, 0, 0, Math.PI * 2, 0);
    else if (style === 'tree') positionTree(root.id, 0, -300, 0, 0, 1);
    else if (style === 'fishbone') positionFishbone(root.id, -400, 0);
    else if (style === 'flow') positionFlow(root.id, -500, 0, 0);

    setNodes(newNodes);
    setLayoutStyle(style);
  };

  // ============ OPERAÇÕES DE NÓS ============
  const addChildNode = (parentId) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;
    const siblings = nodes.filter(n => n.parentId === parentId);
    const angle = (siblings.length * 60) * (Math.PI / 180);
    const newNode = {
      id: 'node_' + Date.now(),
      parentId,
      title: 'Novo Tópico',
      description: '',
      x: parent.x + 250 * Math.cos(angle),
      y: parent.y + 250 * Math.sin(angle),
      color: ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'][siblings.length % 6],
      icon: 'target',
      shape: 'rounded',
      size: 'medium',
      tasks: [],
      attachments: [],
      comments: [],
      progress: 0,
      manualProgress: null,
      expanded: true,
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
    setEditingNodeId(newNode.id);
  };

  const deleteNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.parentId === null) return;
    const toDelete = new Set([nodeId]);
    let changed = true;
    while (changed) {
      changed = false;
      nodes.forEach(n => {
        if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
          toDelete.add(n.id);
          changed = true;
        }
      });
    }
    setNodes(nodes.filter(n => !toDelete.has(n.id)));
    setSelectedNodeId(null);
    setSidePanel(null);
  };

  const updateNode = (nodeId, updates) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  const addTask = (nodeId) => {
    const newTask = {
      id: 'tk_' + Date.now(),
      title: 'Nova tarefa',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignees: [],
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      effort: 0,
    };
    const node = nodes.find(n => n.id === nodeId);
    updateNode(nodeId, { tasks: [...(node.tasks || []), newTask] });
  };

  const updateTask = (nodeId, taskId, updates) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    updateNode(nodeId, {
      tasks: node.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    });
  };

  const deleteTask = (nodeId, taskId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    updateNode(nodeId, { tasks: node.tasks.filter(t => t.id !== taskId) });
  };

  // ============ CANVAS PAN/ZOOM ============
  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-bg')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNodeId(null);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (draggingNodeId) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
      updateNode(draggingNodeId, { x, y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(Math.max(0.2, z * delta), 3));
  };

  const startDragNode = (e, nodeId) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    setDragOffset({ x: mouseX - node.x, y: mouseY - node.y });
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
  };

  // ============ ATALHOS DE TECLADO ============
  useEffect(() => {
    const handleKey = (e) => {
      if (editingNodeId || sidePanel) return;
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        addChildNode(selectedNodeId);
      } else if (e.key === 'Delete' && selectedNodeId) {
        deleteNode(selectedNodeId);
      } else if (e.key === 'Enter' && selectedNodeId) {
        setEditingNodeId(selectedNodeId);
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setZoom(1); setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedNodeId, editingNodeId, sidePanel, nodes]);

  // ============ EXPORTAÇÃO ============
  const exportJSON = () => {
    const data = JSON.stringify({ projects, nodes, team, layoutStyle }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `mindmap-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const rows = [['Nó', 'Tarefa', 'Status', 'Prioridade', 'Responsáveis', 'Início', 'Prazo', 'Esforço']];
    nodes.forEach(n => {
      (n.tasks || []).forEach(t => {
        const assignees = (t.assignees || []).map(id => team.find(p => p.id === id)?.name || '').join('; ');
        rows.push([n.title, t.title, t.status, t.priority, assignees, t.startDate || '', t.dueDate || '', t.effort || '']);
      });
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tarefas-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ============ TEMA ============
  const theme = darkMode ? {
    bg: '#0a0a0f', bgAlt: '#12121a', bgPanel: '#1a1a24',
    border: '#2a2a38', text: '#e8e8f0', textDim: '#8a8a9a',
    accent: '#8b5cf6', grid: 'rgba(139, 92, 246, 0.06)',
  } : {
    bg: '#fafaf7', bgAlt: '#f0efe9', bgPanel: '#ffffff',
    border: '#e5e4dc', text: '#1a1a24', textDim: '#6a6a7a',
    accent: '#6366f1', grid: 'rgba(99, 102, 241, 0.08)',
  };

  const statusConfig = {
    todo:   { label: 'A fazer',     color: '#6b7280', icon: Clock },
    doing:  { label: 'Em andamento', color: '#3b82f6', icon: PlayCircle },
    review: { label: 'Em revisão',   color: '#f59e0b', icon: Eye },
    done:   { label: 'Concluída',    color: '#10b981', icon: CheckCircle2 },
  };

  const priorityConfig = {
    low:      { label: 'Baixa',    color: '#6b7280' },
    medium:   { label: 'Média',    color: '#3b82f6' },
    high:     { label: 'Alta',     color: '#f59e0b' },
    critical: { label: 'Crítica',  color: '#ef4444' },
  };

  const iconMap = { target: Target, zap: Zap, hash: Hash, layout: Layout, settings: Settings, flag: Flag, user: User, layers: Layers };

  // ============ RENDERIZAÇÃO ============
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, color: theme.text, fontFamily: 'ui-sans-serif, system-ui' }}>
        <div style={{ textAlign: 'center' }}>
          <Network size={48} style={{ animation: 'spin 2s linear infinite', marginBottom: 16, color: theme.accent }} />
          <div>Carregando seu workspace...</div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Tela inicial: lista de mapas
  if (showHome || !currentProjectId) {
    return (
      <HomeView
        projects={projects}
        theme={theme}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpen={openProject}
        onCreate={createProject}
        onRename={renameProject}
        onDuplicate={duplicateProject}
        onDelete={deleteProject}
        editingProjectId={editingProjectId}
        setEditingProjectId={setEditingProjectId}
      />
    );
  }

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const visibleNodes = filterPerson
    ? nodesWithProgress.filter(n => (n.tasks || []).some(t => t.assignees?.includes(filterPerson)) || n.parentId === null)
    : nodesWithProgress;
  const searchedNodes = searchQuery
    ? visibleNodes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : visibleNodes;

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: theme.bg, color: theme.text, overflow: 'hidden',
      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        input, textarea, select, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 4px; }
        .canvas-bg { background-image: radial-gradient(circle, ${theme.grid} 1px, transparent 1px); background-size: 24px 24px; }
        .node-shape { transition: box-shadow 0.2s, transform 0.1s; user-select: none; }
        .node-shape:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.25); }
        .node-shape.selected { box-shadow: 0 0 0 2px ${theme.accent}, 0 8px 32px rgba(139,92,246,0.3); }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; border: 1px solid ${theme.border}; background: ${theme.bgPanel}; color: ${theme.text}; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s; }
        .btn:hover { border-color: ${theme.accent}; background: ${theme.bgAlt}; }
        .btn-primary { background: ${theme.accent}; color: white; border-color: ${theme.accent}; }
        .btn-primary:hover { filter: brightness(1.1); background: ${theme.accent}; }
        .btn-icon { padding: 8px; }
        .input { width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid ${theme.border}; background: ${theme.bgAlt}; color: ${theme.text}; font-size: 13px; outline: none; }
        .input:focus { border-color: ${theme.accent}; }
        .tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
      `}</style>

      {/* ============ BARRA SUPERIOR ============ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: `1px solid ${theme.border}`, background: theme.bgPanel, gap: 16, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={backToHome}
            title="Voltar aos meus mapas"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14,
              background: 'transparent', border: 'none', color: theme.text, cursor: 'pointer',
              padding: '4px 8px', borderRadius: 8,
            }}
            onMouseEnter={e => e.currentTarget.style.background = theme.bgAlt}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={16} />
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${theme.accent}, #ec4899)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Network size={16} color="white" />
            </div>
            <span style={{ fontSize: 13, color: theme.textDim }}>
              {projects.find(p => p.id === currentProjectId)?.name || 'Mapa'}
            </span>
          </button>
          <div style={{ display: 'flex', gap: 4, background: theme.bgAlt, padding: 3, borderRadius: 8 }}>
            {[
              { id: 'map', icon: Network, label: 'Mapa' },
              { id: 'gantt', icon: Calendar, label: 'Gantt' },
              { id: 'dashboard', icon: BarChart3, label: 'Painel' },
              { id: 'team', icon: Users, label: 'Equipe' },
            ].map(v => {
              const Icon = v.icon;
              return (
                <button key={v.id} onClick={() => setCurrentView(v.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6,
                  border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  background: currentView === v.id ? theme.bgPanel : 'transparent',
                  color: currentView === v.id ? theme.text : theme.textDim,
                  boxShadow: currentView === v.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}>
                  <Icon size={14} /> {v.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 400 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: theme.textDim }} />
            <input
              type="text" placeholder="Buscar nós e tarefas..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="input" style={{ paddingLeft: 32, fontSize: 12 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: theme.textDim, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: saveStatus === 'saved' ? '#10b981' : '#f59e0b', animation: saveStatus === 'saving' ? 'pulse 1s infinite' : 'none' }} />
            {saveStatus === 'saved' ? 'Sincronizado' : 'Salvando...'}
          </div>
          <button className="btn btn-icon" onClick={() => setDarkMode(!darkMode)} title="Alternar tema">
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button className="btn" onClick={() => setShowTeamModal(true)}>
            <Users size={14} /> Equipe
          </button>
        </div>
      </div>

      {/* ============ CONTEÚDO PRINCIPAL ============ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* MAPA MENTAL */}
        {currentView === 'map' && (
          <>
            {/* Barra de ferramentas lateral esquerda */}
            <div style={{
              width: 56, background: theme.bgPanel, borderRight: `1px solid ${theme.border}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 6,
            }}>
              <button className="btn btn-icon" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Centralizar">
                <Home size={16} />
              </button>
              <button className="btn btn-icon" onClick={() => setZoom(z => Math.min(3, z * 1.2))} title="Zoom +">
                <Maximize2 size={16} />
              </button>
              <button className="btn btn-icon" onClick={() => setZoom(z => Math.max(0.2, z / 1.2))} title="Zoom -">
                <Minimize2 size={16} />
              </button>
              <div style={{ width: 30, height: 1, background: theme.border, margin: '4px 0' }} />

              <div style={{ fontSize: 9, color: theme.textDim, textAlign: 'center', writingMode: 'vertical-rl', marginTop: 4 }}>LAYOUT</div>
              {[
                { id: 'radial', icon: Network, label: 'Radial' },
                { id: 'tree', icon: GitBranch, label: 'Árvore' },
                { id: 'fishbone', icon: Layers, label: 'Espinha' },
                { id: 'flow', icon: ChevronRight, label: 'Fluxo' },
              ].map(l => {
                const Icon = l.icon;
                return (
                  <button key={l.id} onClick={() => applyLayout(l.id)} className="btn btn-icon"
                    title={l.label}
                    style={{ background: layoutStyle === l.id ? theme.accent : theme.bgPanel, color: layoutStyle === l.id ? 'white' : theme.text, borderColor: layoutStyle === l.id ? theme.accent : theme.border }}>
                    <Icon size={15} />
                  </button>
                );
              })}

              <div style={{ flex: 1 }} />
              <button className="btn btn-icon" onClick={exportJSON} title="Exportar JSON">
                <Download size={15} />
              </button>
            </div>

            {/* Canvas principal */}
            <div
              ref={canvasRef}
              className="canvas-bg"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{
                flex: 1, position: 'relative', overflow: 'hidden',
                background: theme.bg, cursor: isPanning ? 'grabbing' : 'grab',
              }}
            >
              <div style={{
                position: 'absolute', transformOrigin: '0 0',
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                width: '100%', height: '100%',
              }}>
                {/* Linhas de conexão */}
                <svg style={{ position: 'absolute', width: 5000, height: 5000, left: -2500, top: -2500, pointerEvents: 'none', overflow: 'visible' }}>
                  {searchedNodes.filter(n => n.parentId).map(n => {
                    const parent = nodes.find(p => p.id === n.parentId);
                    if (!parent) return null;
                    const x1 = parent.x + 2500, y1 = parent.y + 2500;
                    const x2 = n.x + 2500, y2 = n.y + 2500;
                    const midX = (x1 + x2) / 2;
                    const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
                    return (
                      <g key={`link-${n.id}`}>
                        <path d={path} stroke={n.color} strokeWidth={2} fill="none" opacity={0.5} />
                        <path d={path} stroke={n.color} strokeWidth={8} fill="none" opacity={0.1} />
                      </g>
                    );
                  })}
                </svg>

                {/* Nós */}
                {searchedNodes.map(n => {
                  const isSelected = selectedNodeId === n.id;
                  const isRoot = n.parentId === null;
                  const Icon = iconMap[n.icon] || Target;
                  const taskCount = (n.tasks || []).length;
                  const doneTasks = (n.tasks || []).filter(t => t.status === 'done').length;
                  const nodeAssignees = new Set((n.tasks || []).flatMap(t => t.assignees || []));
                  const assigneeMembers = team.filter(p => nodeAssignees.has(p.id));
                  const sizeMap = { small: { w: 160, p: 10 }, medium: { w: 200, p: 14 }, large: { w: 240, p: 18 } };
                  const sz = sizeMap[n.size || 'medium'];

                  return (
                    <div
                      key={n.id}
                      className={`node-shape ${isSelected ? 'selected' : ''}`}
                      onMouseDown={e => startDragNode(e, n.id)}
                      onClick={e => { e.stopPropagation(); setSelectedNodeId(n.id); }}
                      onDoubleClick={e => { e.stopPropagation(); setSidePanel('task'); }}
                      style={{
                        position: 'absolute',
                        left: n.x, top: n.y,
                        transform: 'translate(-50%, -50%)',
                        width: isRoot ? 280 : sz.w,
                        background: isRoot
                          ? `linear-gradient(135deg, ${n.color}, ${n.color}dd)`
                          : theme.bgPanel,
                        border: `2px solid ${n.color}`,
                        borderRadius: n.shape === 'hexagon' ? 16 : n.shape === 'rounded' ? 14 : 6,
                        padding: sz.p,
                        cursor: draggingNodeId === n.id ? 'grabbing' : 'grab',
                        color: isRoot ? 'white' : theme.text,
                        zIndex: isSelected ? 10 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 6,
                          background: isRoot ? 'rgba(255,255,255,0.2)' : n.color + '22',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Icon size={13} color={isRoot ? 'white' : n.color} />
                        </div>
                        {editingNodeId === n.id ? (
                          <input
                            autoFocus
                            value={n.title}
                            onChange={e => updateNode(n.id, { title: e.target.value })}
                            onBlur={() => setEditingNodeId(null)}
                            onKeyDown={e => { if (e.key === 'Enter') setEditingNodeId(null); }}
                            onClick={e => e.stopPropagation()}
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'inherit', fontSize: 14, fontWeight: 600 }}
                          />
                        ) : (
                          <div style={{ flex: 1, fontSize: isRoot ? 15 : 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {n.title}
                          </div>
                        )}
                      </div>

                      {n.description && !isRoot && (
                        <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {n.description}
                        </div>
                      )}

                      {/* Barra de progresso */}
                      {(taskCount > 0 || nodes.some(c => c.parentId === n.id)) && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3, opacity: 0.8 }}>
                            <span>Progresso</span>
                            <span style={{ fontWeight: 600 }}>{n.progress}%</span>
                          </div>
                          <div style={{ height: 5, background: isRoot ? 'rgba(255,255,255,0.2)' : theme.bgAlt, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              width: `${n.progress}%`, height: '100%',
                              background: isRoot ? 'white' : n.color,
                              transition: 'width 0.3s', borderRadius: 3,
                            }} />
                          </div>
                        </div>
                      )}

                      {/* Rodapé do card */}
                      {!isRoot && (taskCount > 0 || assigneeMembers.length > 0) && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: 10 }}>
                          {taskCount > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.textDim }}>
                              <CheckCircle2 size={11} /> {doneTasks}/{taskCount}
                            </div>
                          )}
                          <div style={{ display: 'flex', marginLeft: 'auto' }}>
                            {assigneeMembers.slice(0, 3).map((p, i) => (
                              <div key={p.id} title={p.name} style={{
                                width: 20, height: 20, borderRadius: 10, background: p.color,
                                border: `2px solid ${theme.bgPanel}`, marginLeft: i > 0 ? -6 : 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: 9, fontWeight: 700,
                              }}>{p.avatar}</div>
                            ))}
                            {assigneeMembers.length > 3 && (
                              <div style={{
                                width: 20, height: 20, borderRadius: 10, background: theme.border, color: theme.text,
                                border: `2px solid ${theme.bgPanel}`, marginLeft: -6,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600,
                              }}>+{assigneeMembers.length - 3}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Botões flutuantes quando selecionado */}
                      {isSelected && (
                        <div style={{
                          position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)',
                          display: 'flex', gap: 4, background: theme.bgPanel, padding: 4, borderRadius: 8,
                          border: `1px solid ${theme.border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 20,
                        }}>
                          <button className="btn btn-icon" onClick={e => { e.stopPropagation(); addChildNode(n.id); }} title="Adicionar subnó (Tab)">
                            <Plus size={13} />
                          </button>
                          <button className="btn btn-icon" onClick={e => { e.stopPropagation(); setSidePanel('task'); }} title="Abrir detalhes">
                            <Edit3 size={13} />
                          </button>
                          {!isRoot && (
                            <button className="btn btn-icon" onClick={e => { e.stopPropagation(); if (confirm('Excluir este nó e todos os filhos?')) deleteNode(n.id); }} title="Excluir">
                              <Trash2 size={13} color="#ef4444" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Indicador de zoom */}
              <div style={{
                position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 8, alignItems: 'center',
                background: theme.bgPanel, padding: '6px 12px', borderRadius: 8, border: `1px solid ${theme.border}`,
                fontSize: 11, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace",
              }}>
                <Search size={11} /> {Math.round(zoom * 100)}%
              </div>

              {/* Dicas flutuantes */}
              <div style={{
                position: 'absolute', bottom: 16, right: 16, background: theme.bgPanel,
                padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.border}`,
                fontSize: 10, color: theme.textDim,
              }}>
                <b>Tab</b> novo nó · <b>Enter</b> editar · <b>Del</b> excluir · <b>Scroll</b> zoom
              </div>
            </div>
          </>
        )}

        {/* VISÃO GANTT */}
        {currentView === 'gantt' && <GanttView tasks={stats.allTasks} nodes={nodes} team={team} theme={theme} statusConfig={statusConfig} priorityConfig={priorityConfig} />}

        {/* DASHBOARD */}
        {currentView === 'dashboard' && <DashboardView stats={stats} nodes={nodesWithProgress} team={team} theme={theme} statusConfig={statusConfig} onExportCSV={exportCSV} onExportJSON={exportJSON} />}

        {/* EQUIPE */}
        {currentView === 'team' && <TeamView team={team} setTeam={setTeam} stats={stats} theme={theme} />}

        {/* PAINEL LATERAL DE DETALHES */}
        {sidePanel === 'task' && selectedNode && (
          <DetailsPanel
            node={selectedNode}
            updateNode={updateNode}
            addTask={addTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            team={team}
            theme={theme}
            statusConfig={statusConfig}
            priorityConfig={priorityConfig}
            onClose={() => setSidePanel(null)}
          />
        )}
      </div>

      {/* MODAL EQUIPE */}
      {showTeamModal && <TeamModal team={team} setTeam={setTeam} theme={theme} onClose={() => setShowTeamModal(false)} />}
    </div>
  );
}

// ============================================================
// VIEW: GANTT (LINHA DO TEMPO)
// ============================================================
function GanttView({ tasks, nodes, team, theme, statusConfig, priorityConfig }) {
  const validTasks = tasks.filter(t => t.startDate && t.dueDate);
  if (validTasks.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, flexDirection: 'column', gap: 8 }}>
        <Calendar size={32} />
        <div>Nenhuma tarefa com prazo definido ainda.</div>
        <div style={{ fontSize: 12 }}>Abra uma tarefa no mapa e adicione datas para vê-la aqui.</div>
      </div>
    );
  }

  const minDate = new Date(Math.min(...validTasks.map(t => new Date(t.startDate).getTime())));
  const maxDate = new Date(Math.max(...validTasks.map(t => new Date(t.dueDate).getTime())));
  minDate.setDate(minDate.getDate() - 2);
  maxDate.setDate(maxDate.getDate() + 2);
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
  const dayWidth = 36;
  const today = new Date();
  const todayOffset = Math.floor((today - minDate) / (1000 * 60 * 60 * 24));

  const days = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(minDate); d.setDate(d.getDate() + i);
    days.push(d);
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20, background: theme.bg }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: 20 }}>Linha do Tempo · Gantt</h2>
      <div style={{ background: theme.bgPanel, borderRadius: 12, border: `1px solid ${theme.border}`, overflow: 'auto' }}>
        <div style={{ display: 'flex', minWidth: 'max-content' }}>
          {/* Coluna de tarefas */}
          <div style={{ width: 280, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bgAlt }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, height: 60, display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 12, color: theme.textDim }}>
              TAREFA
            </div>
            {validTasks.map(t => {
              const node = nodes.find(n => n.id === t.nodeId);
              return (
                <div key={t.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}`, height: 44, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <div style={{ width: 4, height: 20, background: node?.color || theme.accent, borderRadius: 2 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: 10, color: theme.textDim }}>{node?.title}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', height: 60, borderBottom: `1px solid ${theme.border}` }}>
              {days.map((d, i) => (
                <div key={i} style={{
                  width: dayWidth, borderRight: `1px solid ${theme.border}`, fontSize: 10,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: d.getDay() === 0 || d.getDay() === 6 ? theme.bgAlt : 'transparent',
                  color: theme.textDim,
                }}>
                  <div>{d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}</div>
                  <div style={{ fontWeight: 600, color: theme.text }}>{d.getDate()}</div>
                </div>
              ))}
            </div>

            {/* Linha do "hoje" */}
            {todayOffset >= 0 && todayOffset < totalDays && (
              <div style={{ position: 'absolute', top: 0, left: todayOffset * dayWidth + dayWidth / 2, width: 2, height: '100%', background: '#ef4444', zIndex: 2, opacity: 0.7 }} />
            )}

            {validTasks.map(t => {
              const start = Math.floor((new Date(t.startDate) - minDate) / (1000 * 60 * 60 * 24));
              const duration = Math.max(1, Math.ceil((new Date(t.dueDate) - new Date(t.startDate)) / (1000 * 60 * 60 * 24)) + 1);
              const statusCfg = statusConfig[t.status];
              const node = nodes.find(n => n.id === t.nodeId);
              return (
                <div key={t.id} style={{ height: 44, borderBottom: `1px solid ${theme.border}`, position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: start * dayWidth + 4, top: 8,
                    width: duration * dayWidth - 8, height: 28,
                    background: node?.color || theme.accent, borderRadius: 6,
                    display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 11,
                    color: 'white', fontWeight: 500, overflow: 'hidden',
                    opacity: t.status === 'done' ? 0.5 : 1,
                    textDecoration: t.status === 'done' ? 'line-through' : 'none',
                  }}>
                    {statusCfg && <div style={{ width: 6, height: 6, borderRadius: 3, background: 'white', marginRight: 6 }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VIEW: DASHBOARD
// ============================================================
function DashboardView({ stats, nodes, team, theme, statusConfig, onExportCSV, onExportJSON }) {
  const cards = [
    { label: 'Total de Tarefas', value: stats.total, color: '#6366f1', icon: Target },
    { label: 'Concluídas', value: stats.done, color: '#10b981', icon: CheckCircle2 },
    { label: 'Em Andamento', value: stats.doing, color: '#3b82f6', icon: PlayCircle },
    { label: 'Atrasadas', value: stats.overdue, color: '#ef4444', icon: AlertCircle },
  ];
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24, background: theme.bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Painel de Controle</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={onExportCSV}><Download size={14} /> CSV</button>
          <button className="btn" onClick={onExportJSON}><Download size={14} /> JSON</button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{ background: theme.bgPanel, padding: 18, borderRadius: 12, border: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: c.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={c.color} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 12, color: theme.textDim, marginTop: 6 }}>{c.label}</div>
            </div>
          );
        })}
      </div>

      {/* Distribuição por status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: theme.bgPanel, padding: 20, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1 }}>Status das Tarefas</h3>
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const count = stats[key] || 0;
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            const Icon = cfg.icon;
            return (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon size={12} color={cfg.color} /> {cfg.label}
                  </span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
                <div style={{ height: 6, background: theme.bgAlt, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: cfg.color, transition: 'width 0.3s' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: theme.bgPanel, padding: 20, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1 }}>Equipe</h3>
          {stats.byPerson.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{p.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: theme.textDim }}>{p.role}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.done}/{p.count}</div>
                <div style={{ fontSize: 10, color: theme.textDim }}>tarefas</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progresso por nó */}
      <div style={{ background: theme.bgPanel, padding: 20, borderRadius: 12, border: `1px solid ${theme.border}` }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1 }}>Progresso por Área</h3>
        {nodes.filter(n => n.parentId !== null).map(n => (
          <div key={n.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: n.color }} />
                {n.title}
              </span>
              <span style={{ fontWeight: 600 }}>{n.progress}%</span>
            </div>
            <div style={{ height: 8, background: theme.bgAlt, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${n.progress}%`, height: '100%', background: n.color, transition: 'width 0.3s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// VIEW: EQUIPE
// ============================================================
function TeamView({ team, setTeam, stats, theme }) {
  const accessConfig = {
    admin:    { label: 'Administrador', color: '#ef4444', icon: Shield },
    editor:   { label: 'Editor',        color: '#3b82f6', icon: Edit3 },
    viewer:   { label: 'Visualizador',  color: '#6b7280', icon: Eye },
  };
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24, background: theme.bg }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: 22 }}>Equipe</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {team.map(p => {
          const personStats = stats.byPerson.find(s => s.id === p.id);
          const AccessIcon = accessConfig[p.access]?.icon || User;
          return (
            <div key={p.id} style={{ background: theme.bgPanel, padding: 20, borderRadius: 12, border: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700 }}>{p.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: theme.textDim }}>{p.role}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 11, color: accessConfig[p.access]?.color }}>
                <AccessIcon size={12} /> {accessConfig[p.access]?.label}
              </div>
              {personStats && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: theme.textDim }}>Progresso</span>
                    <span style={{ fontWeight: 600 }}>{personStats.count > 0 ? Math.round((personStats.done / personStats.count) * 100) : 0}%</span>
                  </div>
                  <div style={{ height: 6, background: theme.bgAlt, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${personStats.count > 0 ? (personStats.done / personStats.count) * 100 : 0}%`, height: '100%', background: p.color }} />
                  </div>
                  <div style={{ fontSize: 11, color: theme.textDim, marginTop: 8 }}>
                    {personStats.done} de {personStats.count} tarefas
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// PAINEL LATERAL: DETALHES DO NÓ
// ============================================================
function DetailsPanel({ node, updateNode, addTask, updateTask, deleteTask, team, theme, statusConfig, priorityConfig, onClose }) {
  const [commentText, setCommentText] = useState('');

  const addComment = () => {
    if (!commentText.trim()) return;
    const newComment = { id: 'c_' + Date.now(), text: commentText, author: 'Você', timestamp: Date.now() };
    updateNode(node.id, { comments: [...(node.comments || []), newComment] });
    setCommentText('');
  };

  const handleFileAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const attachment = {
        id: 'att_' + Date.now(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result,
        uploadedAt: Date.now(),
      };
      updateNode(node.id, { attachments: [...(node.attachments || []), attachment] });
    };
    reader.readAsDataURL(file);
  };

  const colorPresets = ['#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#14b8a6'];

  return (
    <div style={{
      width: 400, background: theme.bgPanel, borderLeft: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
    }}>
      {/* Cabeçalho */}
      <div style={{ padding: 16, borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.textDim }}>DETALHES DO NÓ</div>
        <button className="btn btn-icon" onClick={onClose}><X size={14} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Título e descrição */}
        <input
          className="input"
          value={node.title}
          onChange={e => updateNode(node.id, { title: e.target.value })}
          style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}
          placeholder="Título do nó"
        />
        <textarea
          className="input"
          value={node.description}
          onChange={e => updateNode(node.id, { description: e.target.value })}
          placeholder="Descrição detalhada..."
          rows={3}
          style={{ resize: 'vertical', fontSize: 13, marginBottom: 16 }}
        />

        {/* Aparência */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Aparência</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {colorPresets.map(c => (
              <button key={c} onClick={() => updateNode(node.id, { color: c })} style={{
                width: 28, height: 28, borderRadius: 14, background: c, cursor: 'pointer',
                border: node.color === c ? `2px solid ${theme.text}` : '2px solid transparent',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['small', 'medium', 'large'].map(s => (
              <button key={s} onClick={() => updateNode(node.id, { size: s })}
                className="btn"
                style={{ flex: 1, fontSize: 11, padding: '6px 8px', background: node.size === s ? theme.accent : theme.bgPanel, color: node.size === s ? 'white' : theme.text, borderColor: node.size === s ? theme.accent : theme.border }}>
                {s === 'small' ? 'P' : s === 'medium' ? 'M' : 'G'}
              </button>
            ))}
          </div>
        </div>

        {/* Progresso manual */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: theme.textDim, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Progresso</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{node.progress}%</span>
          </div>
          <div style={{ height: 8, background: theme.bgAlt, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${node.progress}%`, height: '100%', background: node.color, transition: 'width 0.3s' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: theme.textDim }}>
            <input type="checkbox" checked={node.manualProgress !== null && node.manualProgress !== undefined} onChange={e => updateNode(node.id, { manualProgress: e.target.checked ? node.progress : null })} />
            Sobrescrever progresso manualmente
          </label>
          {node.manualProgress !== null && node.manualProgress !== undefined && (
            <input type="range" min="0" max="100" value={node.manualProgress} onChange={e => updateNode(node.id, { manualProgress: Number(e.target.value) })} style={{ width: '100%', marginTop: 6 }} />
          )}
        </div>

        {/* TAREFAS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: theme.textDim, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Tarefas ({(node.tasks || []).length})</div>
            <button className="btn" onClick={() => addTask(node.id)} style={{ padding: '4px 8px', fontSize: 11 }}>
              <Plus size={12} /> Adicionar
            </button>
          </div>
          {(node.tasks || []).map(t => (
            <div key={t.id} style={{ background: theme.bgAlt, padding: 12, borderRadius: 8, marginBottom: 8, border: `1px solid ${theme.border}` }}>
              <input
                className="input"
                value={t.title}
                onChange={e => updateTask(node.id, t.id, { title: e.target.value })}
                style={{ marginBottom: 8, background: 'transparent', border: 'none', padding: 0, fontSize: 13, fontWeight: 500 }}
              />
              <textarea
                className="input"
                value={t.description || ''}
                onChange={e => updateTask(node.id, t.id, { description: e.target.value })}
                placeholder="Descrição..."
                rows={2}
                style={{ marginBottom: 8, fontSize: 11, resize: 'vertical' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                <select className="input" value={t.status} onChange={e => updateTask(node.id, t.id, { status: e.target.value })} style={{ fontSize: 11 }}>
                  {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select className="input" value={t.priority} onChange={e => updateTask(node.id, t.id, { priority: e.target.value })} style={{ fontSize: 11 }}>
                  {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                <input type="date" className="input" value={t.startDate || ''} onChange={e => updateTask(node.id, t.id, { startDate: e.target.value })} style={{ fontSize: 11 }} />
                <input type="date" className="input" value={t.dueDate || ''} onChange={e => updateTask(node.id, t.id, { dueDate: e.target.value })} style={{ fontSize: 11 }} />
              </div>
              <input type="number" className="input" value={t.effort || 0} onChange={e => updateTask(node.id, t.id, { effort: Number(e.target.value) })} placeholder="Esforço (horas)" style={{ fontSize: 11, marginBottom: 8 }} />
              {/* Atribuições */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                {team.map(p => {
                  const assigned = (t.assignees || []).includes(p.id);
                  return (
                    <button key={p.id} onClick={() => {
                      const newAssignees = assigned ? (t.assignees || []).filter(id => id !== p.id) : [...(t.assignees || []), p.id];
                      updateTask(node.id, t.id, { assignees: newAssignees });
                    }} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12,
                      border: 'none', cursor: 'pointer', fontSize: 10,
                      background: assigned ? p.color : theme.bgPanel,
                      color: assigned ? 'white' : theme.textDim,
                      opacity: assigned ? 1 : 0.6,
                    }}>
                      <div style={{ width: 14, height: 14, borderRadius: 7, background: p.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700 }}>{p.avatar}</div>
                      {p.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
              <button className="btn" onClick={() => deleteTask(node.id, t.id)} style={{ fontSize: 10, padding: '4px 8px', color: '#ef4444' }}>
                <Trash2 size={11} /> Excluir tarefa
              </button>
            </div>
          ))}
        </div>

        {/* ANEXOS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Anexos ({(node.attachments || []).length})</div>
          <label className="btn" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
            <Upload size={13} /> Anexar arquivo
            <input type="file" onChange={handleFileAttach} style={{ display: 'none' }} />
          </label>
          {(node.attachments || []).map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: theme.bgAlt, borderRadius: 6, marginTop: 6, fontSize: 12 }}>
              <Paperclip size={12} color={theme.textDim} />
              <a href={a.data} download={a.name} style={{ flex: 1, color: theme.text, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</a>
              <button onClick={() => updateNode(node.id, { attachments: node.attachments.filter(x => x.id !== a.id) })} style={{ border: 'none', background: 'transparent', color: theme.textDim, cursor: 'pointer' }}><X size={12} /></button>
            </div>
          ))}
        </div>

        {/* COMENTÁRIOS */}
        <div>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Comentários ({(node.comments || []).length})</div>
          {(node.comments || []).map(c => (
            <div key={c.id} style={{ padding: 10, background: theme.bgAlt, borderRadius: 6, marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: theme.textDim, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{c.author}</span>
                <span>{new Date(c.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ fontSize: 12 }}>{c.text}</div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <input className="input" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addComment(); }} placeholder="Comentar... use @ para mencionar" style={{ fontSize: 12 }} />
            <button className="btn btn-primary" onClick={addComment}><MessageCircle size={13} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MODAL: GERENCIAR EQUIPE
// ============================================================
function TeamModal({ team, setTeam, theme, onClose }) {
  const [newMember, setNewMember] = useState({ name: '', role: '', access: 'editor' });
  const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#14b8a6', '#f97316'];

  const addMember = () => {
    if (!newMember.name.trim()) return;
    const avatar = newMember.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const color = colors[team.length % colors.length];
    setTeam([...team, { id: 't_' + Date.now(), ...newMember, avatar, color }]);
    setNewMember({ name: '', role: '', access: 'editor' });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: theme.bgPanel, borderRadius: 12, padding: 24, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto', border: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Gerenciar Equipe</h2>
          <button className="btn btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Adicionar novo */}
        <div style={{ background: theme.bgAlt, padding: 14, borderRadius: 8, marginBottom: 16, border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Adicionar membro</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input className="input" placeholder="Nome" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
            <input className="input" placeholder="Cargo" value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="input" value={newMember.access} onChange={e => setNewMember({ ...newMember, access: e.target.value })}>
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
              <option value="viewer">Visualizador</option>
            </select>
            <button className="btn btn-primary" onClick={addMember}><Plus size={13} /> Adicionar</button>
          </div>
        </div>

        {/* Lista */}
        {team.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12 }}>{p.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: theme.textDim }}>{p.role}</div>
            </div>
            <select className="input" value={p.access} onChange={e => setTeam(team.map(x => x.id === p.id ? { ...x, access: e.target.value } : x))} style={{ width: 130, fontSize: 11 }}>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Visualizador</option>
            </select>
            <button className="btn btn-icon" onClick={() => setTeam(team.filter(x => x.id !== p.id))}><Trash2 size={13} color="#ef4444" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TELA INICIAL: LISTA DE MAPAS
// ============================================================
function HomeView({ projects, theme, darkMode, setDarkMode, onOpen, onCreate, onRename, onDuplicate, onDelete, editingProjectId, setEditingProjectId }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState('updated'); // updated | created | name
  const [search, setSearch] = useState('');

  const iconMap = { target: Target, zap: Zap, hash: Hash, layout: Layout, settings: Settings, briefcase: Briefcase, sparkles: Sparkles };

  const sorted = [...projects].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'created') return (b.createdAt || 0) - (a.createdAt || 0);
    return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
  });

  const filtered = search
    ? sorted.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase()))
    : sorted;

  // Estatísticas rápidas de cada projeto (lê do localStorage)
  const getProjectStats = (projectId) => {
    try {
      const raw = localStorage.getItem(`mindmap:project:${projectId}`);
      if (!raw) return { nodes: 0, tasks: 0, done: 0, progress: 0 };
      const data = JSON.parse(raw);
      const nodes = data.nodes || [];
      const allTasks = nodes.flatMap(n => n.tasks || []);
      const done = allTasks.filter(t => t.status === 'done').length;
      const progress = allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0;
      return { nodes: nodes.length, tasks: allTasks.length, done, progress };
    } catch (e) {
      return { nodes: 0, tasks: 0, done: 0, progress: 0 };
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `há ${diffMin} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays} dias`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      color: theme.text,
      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .home-card { transition: all 0.2s ease; cursor: pointer; }
        .home-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.15); }
        .home-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; border: 1px solid ${theme.border}; background: ${theme.bgPanel}; color: ${theme.text}; cursor: pointer; font-size: 13px; font-weight: 500; font-family: inherit; transition: all 0.15s; }
        .home-btn:hover { border-color: ${theme.accent}; background: ${theme.bgAlt}; }
        .home-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid ${theme.border}; background: ${theme.bgAlt}; color: ${theme.text}; font-size: 14px; outline: none; font-family: inherit; }
        .home-input:focus { border-color: ${theme.accent}; }
      `}</style>

      {/* Cabeçalho */}
      <div style={{
        borderBottom: `1px solid ${theme.border}`,
        background: theme.bgPanel,
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${theme.accent}, #ec4899)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Network size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>MindMap Agência</div>
            <div style={{ fontSize: 12, color: theme.textDim }}>Seus mapas mentais em um só lugar</div>
          </div>
        </div>
        <button className="home-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          {darkMode ? 'Claro' : 'Escuro'}
        </button>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.8 }}>Meus Mapas</h1>
            <p style={{ margin: '6px 0 0 0', color: theme.textDim, fontSize: 14 }}>
              {projects.length} {projects.length === 1 ? 'mapa' : 'mapas'} {projects.length > 0 && '· clique para abrir'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 10, border: 'none',
              background: `linear-gradient(135deg, ${theme.accent}, #ec4899)`,
              color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
            }}
          >
            <Plus size={16} /> Novo Mapa
          </button>
        </div>

        {/* Filtros */}
        {projects.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.textDim }} />
              <input
                type="text"
                placeholder="Buscar mapa..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="home-input"
                style={{ paddingLeft: 36 }}
              />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="home-input" style={{ width: 'auto', minWidth: 180 }}>
              <option value="updated">Recentes primeiro</option>
              <option value="created">Criação (novos)</option>
              <option value="name">Ordem alfabética</option>
            </select>
          </div>
        )}

        {/* Grade de cards */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: theme.bgPanel, borderRadius: 16, border: `2px dashed ${theme.border}`,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
              background: `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}11)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FolderPlus size={32} color={theme.accent} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>
              {search ? 'Nenhum mapa encontrado' : 'Comece seu primeiro mapa'}
            </h3>
            <p style={{ margin: '0 0 20px 0', color: theme.textDim, fontSize: 14 }}>
              {search ? 'Tente outra busca' : 'Clique em "Novo Mapa" para criar seu primeiro projeto'}
            </p>
            {!search && (
              <button className="home-btn" onClick={() => setShowCreateModal(true)} style={{ background: theme.accent, color: 'white', borderColor: theme.accent }}>
                <Plus size={14} /> Criar Primeiro Mapa
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {filtered.map(p => {
              const Icon = iconMap[p.icon] || Briefcase;
              const s = getProjectStats(p.id);
              return (
                <div
                  key={p.id}
                  className="home-card"
                  onClick={() => onOpen(p.id)}
                  style={{
                    background: theme.bgPanel,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 14,
                    padding: 20,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Faixa colorida no topo */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                    background: `linear-gradient(90deg, ${p.color || theme.accent}, ${p.color || theme.accent}88)`,
                  }} />

                  {/* Cabeçalho do card */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `${p.color || theme.accent}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={20} color={p.color || theme.accent} />
                    </div>
                    <ProjectMenu
                      project={p}
                      theme={theme}
                      onRename={() => setEditingProjectId(p.id)}
                      onDuplicate={() => onDuplicate(p.id)}
                      onDelete={() => onDelete(p.id)}
                    />
                  </div>

                  {/* Título e descrição */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, letterSpacing: -0.2 }}>{p.name}</div>
                  <div style={{
                    fontSize: 12, color: theme.textDim, marginBottom: 16,
                    minHeight: 32,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {p.description || 'Sem descrição'}
                  </div>

                  {/* Barra de progresso */}
                  {s.tasks > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: theme.textDim }}>
                        <span>Progresso</span>
                        <span style={{ fontWeight: 600, color: theme.text }}>{s.progress}%</span>
                      </div>
                      <div style={{ height: 5, background: theme.bgAlt, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${s.progress}%`, height: '100%',
                          background: p.color || theme.accent, transition: 'width 0.3s',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Estatísticas */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: 12, borderTop: `1px solid ${theme.border}`,
                    fontSize: 11, color: theme.textDim,
                  }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Network size={11} /> {s.nodes}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={11} /> {s.done}/{s.tasks}
                      </span>
                    </div>
                    <span>{formatDate(p.updatedAt || p.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rodapé */}
        <div style={{
          marginTop: 60, padding: 20, textAlign: 'center',
          color: theme.textDim, fontSize: 12,
        }}>
          Seus dados são salvos automaticamente no navegador. Para backup, exporte o JSON dentro de cada mapa.
        </div>
      </div>

      {/* Modal de criar */}
      {showCreateModal && (
        <ProjectModal
          theme={theme}
          title="Novo Mapa"
          onSave={(name, desc, color, icon) => { onCreate(name, desc, color, icon); setShowCreateModal(false); }}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Modal de editar */}
      {editingProjectId && (() => {
        const p = projects.find(x => x.id === editingProjectId);
        if (!p) return null;
        return (
          <ProjectModal
            theme={theme}
            title="Editar Mapa"
            initial={p}
            onSave={(name, desc, color, icon) => { onRename(editingProjectId, name, desc, color, icon); setEditingProjectId(null); }}
            onClose={() => setEditingProjectId(null)}
          />
        );
      })()}
    </div>
  );
}

// Menu de 3 pontinhos em cada card
function ProjectMenu({ project, theme, onRename, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    setTimeout(() => window.addEventListener('click', close), 0);
    return () => window.removeEventListener('click', close);
  }, [open]);

  return (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        style={{
          width: 30, height: 30, borderRadius: 8, border: `1px solid ${theme.border}`,
          background: theme.bgPanel, cursor: 'pointer', color: theme.textDim,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4,
          background: theme.bgPanel, border: `1px solid ${theme.border}`,
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          minWidth: 160, zIndex: 10, overflow: 'hidden',
        }}>
          {[
            { label: 'Renomear', icon: Edit3, action: onRename },
            { label: 'Duplicar', icon: Copy, action: onDuplicate },
            { label: 'Excluir', icon: Trash2, action: onDelete, danger: true },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setOpen(false); item.action(); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', border: 'none', background: 'transparent',
                  color: item.danger ? '#ef4444' : theme.text,
                  cursor: 'pointer', fontSize: 13, textAlign: 'left',
                  borderTop: i > 0 ? `1px solid ${theme.border}` : 'none',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => e.currentTarget.style.background = theme.bgAlt}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon size={13} /> {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Modal de criar/editar projeto
function ProjectModal({ theme, title, initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [color, setColor] = useState(initial?.color || '#6366f1');
  const [icon, setIcon] = useState(initial?.icon || 'briefcase');

  const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#14b8a6'];
  const icons = [
    { id: 'briefcase', Icon: Briefcase },
    { id: 'target', Icon: Target },
    { id: 'zap', Icon: Zap },
    { id: 'layout', Icon: Layout },
    { id: 'hash', Icon: Hash },
    { id: 'sparkles', Icon: Sparkles },
    { id: 'settings', Icon: Settings },
    { id: 'layers', Icon: Layers },
  ];

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), description.trim(), color, icon);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.bgPanel, borderRadius: 14, padding: 28,
          maxWidth: 500, width: '100%', border: `1px solid ${theme.border}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: `1px solid ${theme.border}`,
              background: 'transparent', color: theme.text, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <label style={{ display: 'block', fontSize: 12, color: theme.textDim, marginBottom: 6, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Nome</label>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) handleSave(); }}
          placeholder="Ex: Cliente X — Campanha Verão"
          className="home-input"
          style={{ marginBottom: 16 }}
        />

        <label style={{ display: 'block', fontSize: 12, color: theme.textDim, marginBottom: 6, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Descrição (opcional)</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Do que trata este mapa..."
          rows={3}
          className="home-input"
          style={{ marginBottom: 16, resize: 'vertical', minHeight: 70, fontFamily: 'inherit' }}
        />

        <label style={{ display: 'block', fontSize: 12, color: theme.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Cor</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 36, height: 36, borderRadius: 18, background: c,
                cursor: 'pointer',
                border: color === c ? `3px solid ${theme.text}` : '3px solid transparent',
                transition: 'transform 0.1s',
              }}
            />
          ))}
        </div>

        <label style={{ display: 'block', fontSize: 12, color: theme.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Ícone</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {icons.map(ic => {
            const Ic = ic.Icon;
            const selected = icon === ic.id;
            return (
              <button
                key={ic.id}
                onClick={() => setIcon(ic.id)}
                style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: selected ? color : theme.bgAlt,
                  color: selected ? 'white' : theme.textDim,
                  border: selected ? `2px solid ${color}` : `1px solid ${theme.border}`,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ic size={18} />
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px', borderRadius: 8, border: `1px solid ${theme.border}`,
              background: 'transparent', color: theme.text, cursor: 'pointer',
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: name.trim() ? `linear-gradient(135deg, ${color}, ${color}cc)` : theme.border,
              color: 'white', cursor: name.trim() ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              opacity: name.trim() ? 1 : 0.5,
            }}
          >
            {initial ? 'Salvar alterações' : 'Criar Mapa'}
          </button>
        </div>
      </div>
    </div>
  );
}
