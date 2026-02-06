import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as echarts from 'echarts';
import { PROJECTS } from '../constants';

// Map project locations to US state names
const LOCATION_TO_STATE: Record<string, string> = {
  'Missoula, MT': 'Montana',
  'Pittsburgh, PA': 'Pennsylvania',
  'Redwood City, CA': 'California',
  'New York, NY': 'New York',
  'Boise, ID': 'Idaho'
};

// Approximate state centroids for camera tweening
const STATE_CENTER: Record<string, [number, number]> = {
  California: [-119.5, 37.3],
  Montana: [-110.0, 46.9],
  Pennsylvania: [-77.8, 40.9],
  'New York': [-75.0, 43.0],
  Idaho: [-114.4, 44.2]
};

const DEFAULT_VIEW = {
  center: [-98, 38] as [number, number],
  zoom: 1.1
};

interface ThreeUSMapProps {
  highlightedState?: string | null;
  selectedProject?: string | null;
}

export interface ThreeUSMapRef {
  highlightState: (stateName: string | null) => void;
  animateToProject: (projectId: string | null) => void;
}

export const ThreeUSMap = forwardRef<ThreeUSMapRef, ThreeUSMapProps>(({ highlightedState, selectedProject }, ref) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const mapReadyRef = useRef(false);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;
    let resizeObserver: ResizeObserver | null = null;

    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        chart.resize();
      });
      resizeObserver.observe(chartRef.current);
    }

    // Register USA map with accurate GeoJSON data
    fetch('https://code.highcharts.com/mapdata/countries/us/us-all.geo.json')
      .then(response => response.json())
      .then(usaJson => {
        echarts.registerMap('USA', usaJson);

        const option: echarts.EChartsOption = {
          geo: {
            map: 'USA',
            roam: false,
            aspectScale: 0.75,
            layoutCenter: ['50%', '50%'],
            layoutSize: '100%',
            label: { show: false },
            itemStyle: {
              areaColor: '#f8f6f1',
              borderColor: '#1f1f1f',
              borderWidth: 1.5
            },
            emphasis: {
              // Removed invalid 'focus' property
              label: { show: false },
              itemStyle: {
                areaColor: 'rgba(255, 217, 61, 0.35)',
                borderColor: '#1f1f1f',
                borderWidth: 2
              }
            }
          },
          series: [],
          animation: true,
          animationDuration: 600,
          animationEasing: 'linear'
        };

        chart.setOption(option as any);
        mapReadyRef.current = true;
        requestAnimationFrame(() => chart.resize());
      })
      .catch(error => {
        console.error('Failed to load US map data:', error);
      });

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  // Ensure chart resizes when container size changes
  useEffect(() => {
    if (!chartInstanceRef.current) return;
    chartInstanceRef.current.resize();
  }, []);

  useImperativeHandle(ref, () => ({
    highlightState: (stateName: string | null) => {
      if (!chartInstanceRef.current || !mapReadyRef.current) return;
      
      if (stateName) {
        chartInstanceRef.current.dispatchAction({
          type: 'highlight',
          geoIndex: 0,
          name: stateName
        });
      } else {
        chartInstanceRef.current.dispatchAction({
          type: 'downplay',
          geoIndex: 0
        });
      }
    },
    animateToProject: (projectId: string | null) => {
      if (!chartInstanceRef.current || !mapReadyRef.current) return;
      
      if (projectId) {
        const project = PROJECTS.find(p => p.id === projectId);
        if (project) {
          const stateName = LOCATION_TO_STATE[project.location];
          if (stateName) {
            const center = STATE_CENTER[stateName] || DEFAULT_VIEW.center;
            chartInstanceRef.current.dispatchAction({
              type: 'geoRoam',
              componentType: 'geo',
              name: 'USA',
              zoom: 3,
              center
            });
            chartInstanceRef.current.dispatchAction({
              type: 'highlight',
              geoIndex: 0,
              name: stateName
            });
          }
        }
      } else {
        chartInstanceRef.current.dispatchAction({
          type: 'geoRoam',
          componentType: 'geo',
          name: 'USA',
          zoom: DEFAULT_VIEW.zoom,
          center: DEFAULT_VIEW.center
        });
        chartInstanceRef.current.dispatchAction({
          type: 'downplay',
          geoIndex: 0
        });
      }
    }
  }));

  // Handle hover/selection highlight with an overlay series to keep shadows above other states
  useEffect(() => {
    if (!chartInstanceRef.current || !mapReadyRef.current) return;

    const selectedState =
      selectedProject &&
      LOCATION_TO_STATE[PROJECTS.find(p => p.id === selectedProject)?.location || ''];
    const activeState = selectedState || highlightedState;

  const haloSeries = activeState && STATE_CENTER[activeState]
      ? [
          {
            type: 'scatter' as const,
            coordinateSystem: 'geo' as const,
            zlevel: 12,
            z: 12,
            symbol: 'circle',
            symbolSize: 12,
            itemStyle: {
              color: '#FFD93D',
              shadowBlur: 20,
              shadowColor: 'rgba(255, 217, 61, 0.65)'
            },
            data: [
              {
                name: activeState,
                value: [...STATE_CENTER[activeState], 1]
              }
            ]
          }
        ]
      : [];

    chartInstanceRef.current.setOption(
      {
        geo: {
          itemStyle: {
            areaColor: activeState ? 'rgba(248, 246, 241, 0.55)' : '#f8f6f1'
          },
          regions: activeState
            ? [
                {
                  name: activeState,
                  itemStyle: {
                    areaColor: 'rgba(255, 217, 61, 0.35)',
                    borderColor: '#1f1f1f',
                    borderWidth: 2,
                    shadowBlur: 18,
                    shadowColor: 'rgba(255, 217, 61, 0.4)'
                  }
                }
              ]
            : []
        },
        series: haloSeries
      },
      false
    );

    if (activeState) {
      chartInstanceRef.current.dispatchAction({
        type: 'highlight',
        geoIndex: 0,
        name: activeState
      });
    } else {
      chartInstanceRef.current.dispatchAction({
        type: 'downplay',
        geoIndex: 0
      });
    }
  }, [highlightedState, selectedProject]);

  return <div ref={chartRef} className="w-full h-full" />;
});

ThreeUSMap.displayName = 'ThreeUSMap';
