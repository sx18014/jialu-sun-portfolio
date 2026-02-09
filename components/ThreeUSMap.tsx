import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import * as echarts from 'echarts';
import { PROJECTS, withBase } from '../constants';
import { USMapSVG } from './USMapSVG';

// Map project locations to US state names
const LOCATION_TO_STATE: Record<string, string> = {
  'Missoula, MT': 'Montana',
  'Pittsburgh, PA': 'Pennsylvania',
  'Pittsburgh, MA': 'Pennsylvania',
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
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    if (!chartRef.current) return;

    let rafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let chart: echarts.ECharts | null = null;
    let cancelled = false;

    const handleResize = () => {
      chart?.resize();
    };

    const initWhenReady = () => {
      if (!chartRef.current || cancelled) return;
      if (chartRef.current.clientWidth === 0 || chartRef.current.clientHeight === 0) {
        rafId = requestAnimationFrame(initWhenReady);
        return;
      }

      chart = echarts.init(chartRef.current);
      chartInstanceRef.current = chart;

      if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => {
          chart?.resize();
        });
        resizeObserver.observe(chartRef.current);
      }

      fetch(withBase('/maps/usa.json'))
        .then(response => response.json())
        .then(usaJson => {
          if (!usaJson || !usaJson.features || !Array.isArray(usaJson.features)) {
            throw new Error('Invalid GeoJSON');
          }
          let mapLoaded = false;
          try {
            echarts.registerMap('USA', usaJson as any);
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
                label: { show: false },
                itemStyle: {
                  areaColor: '#FF9ECD',
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

            chart?.setOption(option as any);
            mapLoaded = true;
          } catch (error) {
            console.error('Failed to initialize map:', error);
            setMapFailed(true);
          }

          if (mapLoaded) {
            mapReadyRef.current = true;
            setIsMapReady(true);
            requestAnimationFrame(() => chart?.resize());
          }
        })
        .catch(error => {
          console.error('Failed to load US map data:', error);
          setMapFailed(true);
        });

      window.addEventListener('resize', handleResize);
    };

    initWhenReady();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      chart?.dispose();
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
              color: '#FF9ECD'
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

    try {
      chartInstanceRef.current.setOption(
        {
          geo: {
            itemStyle: {
              areaColor: activeState ? 'rgba(248, 246, 241, 0.9)' : '#f8f6f1'
            },
            regions: activeState
              ? [
                  {
                    name: activeState,
                    itemStyle: {
                      areaColor: '#FF9ECD',
                      borderColor: '#1f1f1f',
                      borderWidth: 2,
                      shadowBlur: 0
                    }
                  }
                ]
              : []
          },
          series: [...haloSeries]
        },
        false
      );
    } catch (error) {
      console.error('Failed to update map:', error);
      setMapFailed(true);
    }

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
  }, [highlightedState, selectedProject, isMapReady]);

  return (
    <div className="relative w-full h-full">
      <div ref={chartRef} className="absolute inset-0 w-full h-full" />
      {!isMapReady && mapFailed && (
        <USMapSVG className="w-full h-full" />
      )}
    </div>
  );
});

ThreeUSMap.displayName = 'ThreeUSMap';
