import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
export default class ErrorBoundary extends React.Component {
  constructor(p){super(p);this.state={hasError:false};}
  static getDerivedStateFromError(){return {hasError:true};}
  componentDidCatch(e,i){console.error('ARES module fault:',e,i);}
  handleReset=()=>{this.setState({hasError:false});this.props.onReset?.();};
  render(){ if(!this.state.hasError) return this.props.children;
    return <div className="flex h-full w-full flex-col items-center justify-center bg-ares-bg px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-ares-danger/40 bg-ares-danger/10"><AlertTriangle className="h-7 w-7 text-ares-danger" /></div>
      <h2 className="font-mono text-sm font-bold uppercase tracking-[0.25em] text-ares-text">Module Fault Detected</h2>
      <p className="mt-2 max-w-sm font-mono text-xs leading-relaxed text-ares-text-muted">{this.props.label||'This visualization module'} failed to initialize. Mission data is safe — reinitialize the module to continue.</p>
      <button onClick={this.handleReset} className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-ares-accent to-ares-accent-soft px-5 py-2.5 font-mono text-xs font-bold text-ares-bg shadow-glow-accent transition-transform hover:scale-[1.03] active:scale-95"><RotateCcw className="h-3.5 w-3.5" />Reinitialize Module</button>
    </div>; }
}
