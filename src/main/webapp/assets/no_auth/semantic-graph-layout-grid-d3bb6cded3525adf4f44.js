(window.webpackJsonp=window.webpackJsonp||[]).push([[483],{1344:function(o,t,e){Object.defineProperty(t,"__esModule",{value:!0});var r=e(33),n=e(16),i=e(1602),s=e(1),a=e(1596),p=e(1821);t.component=a.registerCytoscapeLayout("grid",i.identity,(function mapOptions(o,t){if(n.has(t,"sortBy")){var e=t.sortBy;t.sort=p.sort(e)}(n.has(t,"positionRow")||n.has(t,"positionCol"))&&(t.position=function positionBy(o,t){var e=r.fromNullable(o).map(p.getNumberValueForProperty).getOrElse(r.Nothing),n=r.fromNullable(t).map(p.getNumberValueForProperty).getOrElse(r.Nothing);return function(o){return{row:e(o).getOrElse(void 0),col:n(o).getOrElse(void 0)}}}(t.positionRow,t.positionCol));return t})),t.factory=s.createFactory(t.component),t.default=t.component}}]);
//# sourceMappingURL=semantic-graph-layout-grid-d3bb6cded3525adf4f44.js.map