/**
 * Copyright (C) 2022, Swiss Art Research Infrastructure, University of Zurich
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import { createElement } from 'react';

import { Component } from 'platform/api/components';
import { BuiltInEvents, trigger } from 'platform/api/events';
import { ErrorNotification } from 'platform/components/ui/notification';
import { Spinner } from 'platform/components/ui/spinner';

import { MultiDirectedGraph } from "graphology";
import { SigmaContainer, ControlsContainer, SearchControl } from "@react-sigma/core";
import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";

import { SigmaGraphConfig } from './Config'
import { GraphEvents } from './GraphEvents'
import { createGraphFromElements, loadGraphDataFromQuery } from './Common'

import "@react-sigma/core/lib/react-sigma.min.css";
export interface State {
    elements: Cy.ElementDefinition[];
    graph: MultiDirectedGraph;
    noResults?: boolean;
    isLoading?: boolean;
    error?: any;
    warning?: string;
  }
export class SigmaGraph extends Component<SigmaGraphConfig, State> {

    constructor(props: SigmaGraphConfig, context: any) {
        super(props, context);
        this.state = {
          elements: [],
          graph: undefined,
          noResults: false,
          isLoading: true
        };
      }
    
    componentDidMount() : void {
        this.loadInitialGraphData(this.props);
    }

    private loadInitialGraphData(props: SigmaGraphConfig) : void {
        this.setState({ error:undefined });
        loadGraphDataFromQuery(props.query, this.context.semanticContext).onValue((elements) => {
                this.setState({
                    elements: elements,
                    noResults: !elements.length,
                    isLoading: false
                })
            })
            .onError((error) => { this.setState({ error: error, isLoading: false }) })
            .onEnd(() => {
                const graph = createGraphFromElements(this.state.elements, this.props)
                this.setState({ graph: graph})
                if (this.props.id) {
                    trigger({ eventType: BuiltInEvents.ComponentLoaded, source: this.props.id });
                }
            })
    }

    render() {
        const width = this.props.width || "800px";
        const height = this.props.height || "600px";
        const searchBox = this.props.searchBox || false;

        const sigmaSettings = { 
            defaultEdgeType: "arrow",
            defaultNodeType: "image",
            nodeProgramClasses: { image: getNodeProgramImage() },
            renderEdgeLabels: true,
            autoRescale: false,
            maxEdgeSize: 2,
        };

        if (this.state.isLoading) {
            return createElement(Spinner);
        } else if (this.state.error) {
            return createElement(ErrorNotification, { errorMessage: this.state.error });
        } else {
            return (
                <SigmaContainer
                    graph={ this.state.graph } 
                    style={{ height: `${height}`, width: `${width}` }}
                    settings={ sigmaSettings }
                >   
                    <GraphEvents 
                        context={ this.context.semanticContext} 
                        colours={ this.props.colours }
                        grouping={ this.props.grouping } 
                        nodeQuery={ this.props.nodeQuery }
                        sizes={ this.props.sizes } 
                    />
                    {searchBox && <ControlsContainer><SearchControl /></ControlsContainer>}
                </SigmaContainer>

            )
        }
    }
}

export default SigmaGraph