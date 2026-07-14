import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface CitationNode extends d3.SimulationNodeDatum {
  id: string;
  type: 'statute' | 'case' | 'treaty' | 'article';
  jurisdiction: string;
  title: string;
  year?: number;
  abstract?: string;
  signatories?: string[];
  status?: string;
}

export interface CitationLink extends d3.SimulationLinkDatum<CitationNode> {
  source: string | CitationNode;
  target: string | CitationNode;
  relation: 'cites' | 'amends' | 'overrules' | 'supports';
}

interface CitationNetworkProps {
  nodes: CitationNode[];
  links: CitationLink[];
  onNodeClick?: (node: CitationNode) => void;
  isDarkMode?: boolean;
  clusterByJurisdiction?: boolean;
  searchQuery?: string;
}

const colorMap = {
  statute: '#4f46e5', // indigo-600
  case: '#e11d48',    // rose-600
  treaty: '#059669',  // emerald-600
  article: '#d97706'  // amber-600
};

export const CitationNetwork: React.FC<CitationNetworkProps> = ({ nodes, links, onNodeClick, isDarkMode, clusterByJurisdiction = false, searchQuery = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous SVG
    d3.select(containerRef.current).selectAll('*').remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height]);

    // Add zoom capabilities
    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 4])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    svg.call(zoom);

    const g = svg.append('g');

    const simulation = d3.forceSimulation<CitationNode>(nodes)
      .force('link', d3.forceLink<CitationNode, CitationLink>(links).id(d => d.id).distance(100));

    if (clusterByJurisdiction) {
      const jurisdictions = Array.from(new Set(nodes.map(n => n.jurisdiction)));
      const radius = Math.min(width, height) * 0.35;
      
      const jurisdictionCenters = jurisdictions.reduce((acc, curr, index) => {
          const angle = (index / jurisdictions.length) * 2 * Math.PI - Math.PI / 2;
          acc[curr] = {
              x: width / 2 + Math.cos(angle) * radius,
              y: height / 2 + Math.sin(angle) * radius
          };
          return acc;
      }, {} as Record<string, { x: number, y: number }>);

      simulation
        .force('x', d3.forceX<CitationNode>().x(d => jurisdictionCenters[d.jurisdiction].x).strength(0.8))
        .force('y', d3.forceY<CitationNode>().y(d => jurisdictionCenters[d.jurisdiction].y).strength(0.8))
        .force('collide', d3.forceCollide().radius(40))
        .force('charge', d3.forceManyBody().strength(-50));
    } else {
      simulation
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide().radius(30));
    }

    // Links
    const link = g.append('g')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', isDarkMode ? '#475569' : '#cbd5e1') // slate-600 vs slate-300
      .attr('stroke-width', 2);

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, CitationNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d);
      })
      .on('mouseover', (event, d) => {
        node.attr('opacity', n => {
          if (n.id === d.id) return 1;
          const isConnected = links.some(l => 
            ((l.source as CitationNode).id === d.id && (l.target as CitationNode).id === n.id) ||
            ((l.target as CitationNode).id === d.id && (l.source as CitationNode).id === n.id)
          );
          return isConnected ? 1 : 0.1;
        });
        link.style('opacity', l => {
          return ((l.source as CitationNode).id === d.id || (l.target as CitationNode).id === d.id) ? 1 : 0.1;
        });
      })
      .on('mouseout', () => {
        node.attr('opacity', n => {
          if (!searchQuery) return 1;
          const query = searchQuery.toLowerCase();
          const match = n.title.toLowerCase().includes(query) || n.jurisdiction.toLowerCase().includes(query);
          return match ? 1 : 0.15;
        });
        link.style('opacity', 1);
      });

    // Node circles
    node.append('circle')
      .attr('r', 12)
      .attr('fill', d => colorMap[d.type])
      .attr('stroke', isDarkMode ? '#1e293b' : '#ffffff')
      .attr('stroke-width', 2);

    node.attr('opacity', d => {
        if (!searchQuery) return 1;
        const query = searchQuery.toLowerCase();
        const match = d.title.toLowerCase().includes(query) || d.jurisdiction.toLowerCase().includes(query);
        return match ? 1 : 0.15;
    });

    // Node labels
    node.append('text')
      .text(d => d.title)
      .attr('x', 16)
      .attr('y', 4)
      .attr('font-size', '12px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '500')
      .attr('fill', isDarkMode ? '#e2e8f0' : '#334155'); // slate-200 vs slate-700
      
    // Jurisdiction subtags
    node.append('text')
      .text(d => d.jurisdiction)
      .attr('x', 16)
      .attr('y', 16)
      .attr('font-size', '9px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '700')
      .style('text-transform', 'uppercase')
      .style('letter-spacing', '0.05em')
      .attr('fill', isDarkMode ? '#64748b' : '#94a3b8');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as CitationNode).x!)
        .attr('y1', d => (d.source as CitationNode).y!)
        .attr('x2', d => (d.target as CitationNode).x!)
        .attr('y2', d => (d.target as CitationNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, onNodeClick, isDarkMode, clusterByJurisdiction, searchQuery]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-sm pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Legend</span>
            {Object.entries(colorMap).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">{type}</span>
                </div>
            ))}
        </div>
    </div>
  );
};
