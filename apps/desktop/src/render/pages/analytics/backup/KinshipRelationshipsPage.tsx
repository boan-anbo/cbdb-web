import React, { useState, useEffect, useMemo } from 'react';
import NetworkGraph from '@/render/components/visualization/NetworkGraph/NetworkGraph';
import { NetworkGraphData, LayoutType } from '@/render/components/visualization/NetworkGraph/NetworkGraph.types';
import { useKinshipNetwork } from '@/render/hooks/useKinshipNetwork';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/render/components/ui/card';
import { Input } from '@/render/components/ui/input';
import { Button } from '@/render/components/ui/button';
import { Label } from '@/render/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/render/components/ui/toggle-group';
import { Alert, AlertDescription, AlertTitle } from '@/render/components/ui/alert';
import { Badge } from '@/render/components/ui/badge';
import { Separator } from '@/render/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/render/components/ui/select';
import {
  Search,
  Users,
  Loader2,
  AlertCircle,
  Code2,
  X,
  RefreshCw,
  Network,
  Info,
  Shuffle,
  Circle,
  GitBranch,
  Grid3X3
} from 'lucide-react';
import { toast } from 'sonner';

const KinshipRelationshipsPage: React.FC = () => {
  const [personId, setPersonId] = useState<number>(1762); // Default to Wang Anshi
  const [depth, setDepth] = useState<string>('1');
  const [inputValue, setInputValue] = useState<string>('1762');
  const [showGraphData, setShowGraphData] = useState<boolean>(false);
  const [layoutType, setLayoutType] = useState<LayoutType>('force');

  const { graphData, loading, error, refetch } = useKinshipNetwork({
    personId,
    depth: parseInt(depth)
  });

  const handleSearch = () => {
    const id = parseInt(inputValue);
    if (!isNaN(id) && id > 0) {
      setPersonId(id);
      toast.success(`Loading kinship network for person ${id}`);
    } else {
      toast.error('Please enter a valid person ID');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDepthChange = (value: string) => {
    if (value) {
      setDepth(value);
    }
  };

  const nodeCount = graphData?.nodes?.length || 0;
  const edgeCount = graphData?.edges?.length || 0;

  // Get theme colors from CSS variables
  const [themeColors, setThemeColors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get CSS variable values
    const root = getComputedStyle(document.documentElement);
    setThemeColors({
      primary: root.getPropertyValue('--primary').trim() || '#5187e0',
      chart1: root.getPropertyValue('--chart-1').trim() || '#5187e0',
      chart2: root.getPropertyValue('--chart-2').trim() || '#3d6cd3',
      chart3: root.getPropertyValue('--chart-3').trim() || '#3359c2',
      mutedForeground: root.getPropertyValue('--muted-foreground').trim() || '#6d727e',
    });
  }, []);

  // The graphData is already in SerializedGraph format from useKinshipNetwork
  // We can use it directly with NetworkGraph which accepts SerializedGraph
  const processedGraphData = useMemo(() => {
    if (!graphData || !themeColors.primary) return null;

    // Apply theme colors to the existing graph data
    return {
      ...graphData,
      nodes: graphData.nodes?.map((node: any) => ({
        ...node,
        attributes: {
          ...node.attributes,
          color: node.attributes?.isCentral
            ? themeColors.primary
            : node.attributes?.depth === 1
              ? themeColors.chart1
              : node.attributes?.depth === 2
                ? themeColors.chart2
                : themeColors.chart3,
          size: node.attributes?.isCentral
            ? 30  // Much larger for central node
            : node.attributes?.depth === 1
              ? 15  // Medium for direct connections
              : 10, // Smaller for indirect connections
        }
      })),
      edges: graphData.edges?.map((edge: any) => ({
        ...edge,
        attributes: {
          ...edge.attributes,
          color: themeColors.mutedForeground + '99',
          size: 1
        }
      }))
    };
  }, [graphData, themeColors]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Kinship Relationships Network</h1>
        <p className="text-muted-foreground">
          Explore family relationships and kinship connections in the CBDB database
        </p>
      </div>

      {/* Controls Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Search Controls</CardTitle>
          <CardDescription>
            Enter a person ID and adjust network depth to explore relationships
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-12">
            {/* Person ID Search */}
            <div className="md:col-span-5">
              <Label htmlFor="person-id">Person ID</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="person-id"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter person ID (e.g., 1762)"
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  size="default"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search
                </Button>
              </div>
            </div>

            {/* Depth Selector */}
            <div className="md:col-span-4">
              <Label htmlFor="depth">Relationship Distance</Label>
              <ToggleGroup
                type="single"
                value={depth}
                onValueChange={handleDepthChange}
                className="justify-start mt-2"
              >
                <ToggleGroupItem value="1" aria-label="Immediate family">
                  Immediate
                </ToggleGroupItem>
                <ToggleGroupItem value="2" aria-label="Extended family">
                  Extended
                </ToggleGroupItem>
                <ToggleGroupItem value="3" aria-label="Distant relations">
                  Distant
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-3 flex items-end gap-2">
              <Button
                onClick={refetch}
                disabled={loading}
                variant="outline"
                size="default"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                onClick={() => setShowGraphData(!showGraphData)}
                variant="outline"
                size="default"
              >
                <Code2 className="w-4 h-4" />
                {showGraphData ? 'Hide' : 'Show'} Data
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          {graphData && !loading && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="gap-2">
                  <Users className="w-3 h-3" />
                  {nodeCount} {nodeCount === 1 ? 'Person' : 'People'}
                </Badge>
                <Badge variant="secondary" className="gap-2">
                  <Network className="w-3 h-3" />
                  {edgeCount} {edgeCount === 1 ? 'Relationship' : 'Relationships'}
                </Badge>
                <Badge variant="outline">
                  Central Person: #{personId}
                </Badge>
                <Badge variant="outline">
                  Distance: {depth === '1' ? 'Immediate' : depth === '2' ? 'Extended' : 'Distant'}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Graph Visualization Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Network Visualization</CardTitle>

          {/* Layout Selector */}
          <div className="flex items-center gap-2">
            <Label htmlFor="layout-selector" className="text-sm font-medium">
              Layout:
            </Label>
            <Select value={layoutType} onValueChange={(value: LayoutType) => setLayoutType(value)}>
              <SelectTrigger id="layout-selector" className="w-[160px] h-8 text-sm">
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="force">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3 h-3" />
                    <span>Force</span>
                  </div>
                </SelectItem>
                <SelectItem value="circular">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3" />
                    <span>Circular</span>
                  </div>
                </SelectItem>
                <SelectItem value="random">
                  <div className="flex items-center gap-2">
                    <Shuffle className="w-3 h-3" />
                    <span>Random</span>
                  </div>
                </SelectItem>
                <SelectItem value="grid">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="w-3 h-3" />
                    <span>Grid</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Graph Data Panel (Overlay) */}
          {showGraphData && graphData && (
            <div className="absolute top-4 right-4 z-10 max-w-md">
              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Graph Data</CardTitle>
                    <Button
                      onClick={() => setShowGraphData(false)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-auto">
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(graphData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="h-[600px] flex items-center justify-center bg-muted/10">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <div>
                  <p className="text-lg font-medium">Loading kinship network...</p>
                  <p className="text-sm text-muted-foreground">
                    Fetching relationships for person #{personId}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="h-[600px] flex items-center justify-center bg-muted/10">
              <Alert className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Failed to Load Network</AlertTitle>
                <AlertDescription className="mt-2">
                  {error.message}
                </AlertDescription>
                <Button
                  onClick={refetch}
                  className="mt-4"
                  variant="default"
                  size="sm"
                >
                  Try Again
                </Button>
              </Alert>
            </div>
          )}

          {/* Graph Component */}
          {!loading && !error && processedGraphData && (
            <div className="h-[600px] bg-background">
              <NetworkGraph
                data={processedGraphData}
                layout={layoutType}
                layoutConfig={{
                  force: {
                    iterations: 100,
                    gravity: 1,
                    scalingRatio: 10,
                    barnesHutOptimize: true
                  },
                  circular: {
                    scale: 500,
                    center: 0.5
                  },
                  random: {
                    scale: 500,
                    center: 0.5
                  },
                  grid: {
                    columns: 5,
                    spacing: 100
                  }
                }}
                height="600px"
                showLabels={true}
                enableHover={true}
                showControls={true}
                nodeColorScheme="custom"
                onNodeClick={(node) => {
                  // Extract person ID from node ID (format: "person:1762")
                  const id = node.id.replace('person:', '');
                  setInputValue(id);
                  setPersonId(parseInt(id));
                  toast.info(`Selected person #${id}. Click Search to load their network.`);
                }}
              />
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && !graphData && (
            <div className="h-[600px] flex items-center justify-center bg-muted/10">
              <div className="text-center space-y-4 max-w-md">
                <Info className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">No Data Available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter a person ID and click Search to visualize their kinship network
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KinshipRelationshipsPage;