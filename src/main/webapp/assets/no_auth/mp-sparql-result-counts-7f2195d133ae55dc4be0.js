(window.webpackJsonp=window.webpackJsonp||[]).push([[214],{1250:function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0});var s=n(11),i=n(1),o=n(33),r=n(16),u=n(56),l=n(162),a=n(61),p=n(327),m=n(630),c=function(t){function ResultsNumberComponent(e,n){var i=t.call(this,e,n)||this;return i.calcResultsNumber=function(t){i.setState({isLoading:!0});var e=i.prepareCountQuery(a.SparqlUtil.parseQuerySync(t)),n=a.SparqlClient.select(e,{context:i.context.semanticContext}).map((function(t){return parseInt(t.results.bindings[0].count.value)})).onValue(i.updateCounts).onError(i.onError);i.props.id&&l.trigger({eventType:l.BuiltInEvents.ComponentLoading,source:i.props.id,data:n})},i.prepareCountQuery=function(t){var e=new(function(t){function class_1(){var e=null!==t&&t.apply(this,arguments)||this;return e.limits=[],e}return s.__extends(class_1,t),class_1.prototype.select=function(e){return e.limit&&(this.limits.push(e.limit),delete e.limit),t.prototype.select.call(this,e)},class_1}(a.QueryVisitor));return e.sparqlQuery(t),i.limit=e.limits.length?Math.min.apply(Math,e.limits):void 0,t.prefixes={},"SELECT (COUNT(*) AS ?count) WHERE {{"+a.SparqlUtil.serializeQuery(t)+"}}"},i.updateCounts=function(t){i.setState({number:o.Just(i.limit<=t?i.limit:t),totalNumber:i.limit&&i.limit<t?o.Just(t):o.Nothing(),isLoading:!1})},i.onError=function(t){throw t},i.state={number:o.Nothing(),totalNumber:o.Nothing(),isLoading:!1},i}return s.__extends(ResultsNumberComponent,t),ResultsNumberComponent.prototype.componentDidMount=function(){this.calcResultsNumber(this.props.query)},ResultsNumberComponent.prototype.componentWillReceiveProps=function(t){r.isEqual(t.query,this.props.query)||this.calcResultsNumber(t.query)},ResultsNumberComponent.prototype.render=function(){return this.state.number.isJust&&!this.state.isLoading?i.createElement(m.TemplateItem,{template:{source:this.props.template,options:{numberOfResults:this.state.number.get(),totalNumberOfResults:this.state.totalNumber.getOrElse(void 0),hasLimit:this.state.totalNumber.isJust}}}):this.state.isLoading?i.createElement(p.Spinner):null},ResultsNumberComponent.defaultProps={template:"\n        showing {{numberOfResults}} {{#if hasLimit}} of {{totalNumberOfResults}} {{/if}}\n    "},ResultsNumberComponent}(u.Component);e.ResultsNumberComponent=c,e.default=c}}]);
//# sourceMappingURL=mp-sparql-result-counts-7f2195d133ae55dc4be0.js.map