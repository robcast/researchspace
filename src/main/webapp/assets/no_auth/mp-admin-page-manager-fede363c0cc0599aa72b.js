(window.webpackJsonp=window.webpackJsonp||[]).push([[334],{1392:function(e,t,a){Object.defineProperty(t,"__esModule",{value:!0});var n,i=a(11),l=a(1),r=a(35),o=a(33),s=a(16),d=a(72),c=a(1625),u=a(19),f=a(10),g=a(1213),p=a(1559),m=a(331),v=a(1690),y=a(630),b=a(631),h=a(327),N=a(117),P=a(636),S=l.createFactory(p.default),E=l.createFactory(d.Button),L=l.createFactory(d.ButtonToolbar);!function(e){e[e.NONE=0]="NONE",e[e.ALL=1]="ALL",e[e.MODIFIEDTODAY=2]="MODIFIEDTODAY"}(n||(n={}));var O=function(e){function PageManager(t,a){var d=e.call(this,t,a)||this;return d.filterPages=function(e){switch(e){case n.ALL:d.filterAll();break;case n.NONE:d.filterNone();break;case n.MODIFIEDTODAY:d.filterModifiedToday();break;default:d.filterNone()}},d.filterAll=function(){var e=[];s.forEach(d.state.data,(function(t){e.push(t)})),d.setState({selectedPages:e,isLoading:!1,filter:n.ALL})},d.filterModifiedToday=function(){var e=[];s.forEach(d.state.data,(function(t){f(t.date).isSame(f(),"day")&&e.push(t)})),d.setState({selectedPages:e,isLoading:!1,filter:n.MODIFIEDTODAY})},d.filterNone=function(){d.setState({selectedPages:[],isLoading:!1,filter:n.NONE})},d.getTable=function(){var e={onRowClick:d.onChange.bind(d),resultsPerPage:10,rowMetadata:{bodyCssClassName:d.getRowClass.bind(d)}},t={className:"dataset-selector__multi-select",multi:!1,options:[{value:n.NONE,label:"None"},{value:n.ALL,label:"All"},{value:n.MODIFIEDTODAY,label:"Modified today"}],optionRenderer:function(e){return e.label},clearable:!0,allowCreate:!1,autoload:!0,clearAllText:"Remove all",clearValueText:"Remove filter",delimiter:"|",disabled:!1,ignoreCase:!0,matchPos:"any",matchProp:"any",noResultsText:"",searchable:!1,placeholder:"Filter",onChange:d.onFilter,value:d.state.filter},a={display:"flex",alignItems:"center",paddingRight:"20px"};return r.div({className:"mph-page-admin-widget",onChange:d.onChange.bind(d)},l.createElement(v.Table,{ref:"table-ref",key:"table",numberOfDisplayedRows:o.Just(10),data:c.Left(d.state.data),columnConfiguration:[{variableName:"iri",displayName:"Page",cellTemplate:"<semantic-link iri='{{iri}}' getlabel=false>{{iri}}</semantic-link>"},{variableName:"appId",displayName:"Source app"},{variableName:"revision",displayName:"Revision"},{variableName:"author",displayName:"Creator"},{variableName:"date",displayName:"Last Modified",cellTemplate:"{{dateTimeFormat date 'LLL'}}"}],layout:o.Just({options:e,tupleTemplate:o.Nothing()})}),r.div({style:{display:"grid",gridTemplateColumns:"1fr 1.5fr fit-content(100px)",alignItems:"center",marginTop:"10px",width:"100%"},key:"selected-pages"},r.div({style:a},r.div({style:{paddingRight:"20px"}},"Selected pages:"),r.b({},d.state.selectedPages.length)),r.div({},r.div({style:a,key:"1"},"Select pages: ",r.div({style:{flexGrow:1},key:"2"},S(t)))),r.div({},L({style:{display:"flex",paddingLeft:"20px"}},E({type:"submit",bsSize:"small",bsStyle:"primary",onClick:d.onClickExportSelected},"Export Selected"),E({type:"submit",bsSize:"small",bsStyle:"danger",onClick:d.onClickDeleteSelected,disabled:d.state.selectedPages.length===d.state.data.length},"Delete Selected"))),l.createElement(b.Alert,d.state.alert.map((function(e){return e})).getOrElse({alert:b.AlertType.NONE,message:""}))))},d.onFilter=function(e){var t=s.isEmpty(e)?n.NONE:e.value;d.filterPool.plug(u.constant(t))},d.onClickDeleteSelected=function(){var onHide=function(){return N.getOverlaySystem().hide("deletion-confirmation")},e={message:"Do you want to delete the selected templates?",onHide,onConfirm:function(e){onHide(),e&&d.deleteSelectedPages()}};N.getOverlaySystem().show("deletion-confirmation",l.createElement(P.ConfirmationDialog,e))},d.deleteSelectedPages=function(){m.PageService.deleteTemplateRevisions(d.state.selectedPages).onValue((function(e){e&&window.location.reload()})).onError((function(e){return d.setState({isLoading:!1,alert:o.Just(b.Error(e.response.text))})}))},d.onClickExportSelected=function(){m.PageService.exportTemplateRevisions(d.state.selectedPages).onValue((function(e){var t="",a=e.header["content-disposition"];if(a&&-1!==a.indexOf("attachment")){var n=/filename[^;=\n]*=((['']).*?\2|[^;\n]*)/.exec(a);null!=n&&n[1]&&(t=n[1].replace(/['']/g,""))}var i=e.header["content-type"],l=new Blob([e.xhr.response],{type:i});g.saveAs(l,t)})).onError((function(e){return d.setState({isLoading:!1,alert:o.Just(b.Error(e))})}))},d.getRowClass=function(e){return d.state.selectedPages.some((function(t){return sameRevision(t,e)}))?"bg-success":""},d.addOrRemoveSelected=function(e){var t=d.state.selectedPages;t=t.some((function(t){return sameRevision(t,e)}))?t.filter((function(t){return!sameRevision(t,e)})):i.__spreadArrays(t,[e]),d.setState({isLoading:!1,selectedPages:t})},d.onChange=function(e){s.isUndefined(e)||s.isUndefined(e.props)||d.addOrRemoveSelected(e.props.data)},d.state={isLoading:!0,selectedPages:[],filter:n.NONE,alert:o.Nothing(),err:o.Nothing()},d.filterPool=u.pool(),d.filterPool.onValue((function(e){return d.filterPages(e)})),d}return i.__extends(PageManager,e),PageManager.prototype.render=function(){return this.state.err.isJust?l.createElement(y.TemplateItem,{template:{source:this.state.err.get()}}):this.state.isLoading?l.createElement(h.Spinner):this.getTable()},PageManager.prototype.componentWillMount=function(){var e=this;m.PageService.getAllTemplateInfos().onValue((function(t){e.setState({isLoading:!1,data:t})})).onError((function(t){return e.setState({isLoading:!1,err:o.Just(t)})}))},PageManager}(l.Component);function sameRevision(e,t){return e.appId===t.appId&&e.iri===t.iri&&e.revision===t.revision}t.PageManager=O,t.default=O}}]);
//# sourceMappingURL=mp-admin-page-manager-fede363c0cc0599aa72b.js.map