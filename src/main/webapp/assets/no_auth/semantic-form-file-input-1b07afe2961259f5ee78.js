(window.webpackJsonp=window.webpackJsonp||[]).push([[473],{1389:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0});var a=r(11),n=r(19),l=r(1),o=r(16),i=r(72),s=r(34),p=r(1211),u=r(631),c=r(1654),d=r(1619),m=r(1553),f=r(1239),g=r(1219),h=function(e){function FileInput(t,r){var n=e.call(this,t,r)||this;return n.cancellation=new s.Cancellation,n.renderBody=function(){return m.FieldValue.isEmpty(n.props.value)?n.props.fromUrlOrDrop?l.createElement("div",{className:g.selectorHolder},n.renderInputSelector(),n.state.selectUrl?n.renderUrlInput():n.renderDropZone()):n.renderDropZone():n.state.alertState?n.renderError():n.renderProgress()},n.renderUrlInput=function(){var e=n.state.alertState?l.createElement(u.Alert,a.__assign({},n.state.alertState)):null;return l.createElement(l.Fragment,null,e?l.createElement("div",{className:g.alertComponent},e):null,l.createElement("div",{className:g.urlInputHolder},l.createElement(i.FormControl,{inputRef:function(e){n.urlInputRef=e},type:"text",placeholder:"Please type file URL here"}),l.createElement(i.Button,{bsStyle:"primary",type:"submit",onClick:n.fetchFileFromUrl},"Fetch")))},n.renderInputSelector=function(){return l.createElement(i.FormGroup,null,l.createElement(i.Radio,{name:"inputSelector",inline:!0,checked:!n.state.selectUrl,onClick:function(){return n.setState({selectUrl:!1})}},"File Upload")," ",l.createElement(i.Radio,{name:"inputSelector",inline:!0,checked:n.state.selectUrl,onClick:function(){return n.setState({selectUrl:!0})}},"URL")," ")},n.fetchFileFromUrl=function(){var e;o.isEmpty(null===(e=n.urlInputRef)||void 0===e?void 0:e.value)||fetch(n.urlInputRef.value).then((function(e){return e.ok||n.setState({alertState:{alert:u.AlertType.WARNING,message:"Faild to fetch file from URL!"}}),e.blob()})).then((function(e){n.onDropAccepted([new File([e],n.urlInputRef.value,{type:e.type})])})).catch((function(e){n.setState({alertState:{alert:u.AlertType.WARNING,message:e.message+" Please, try to upload the file manually."}})}))},n.removeFile=function(){var e=m.FieldValue.asRdfNode(n.props.value);p.FileManager.isTemporaryResource(e)?n.getFileManager().deleteFileResource(e,n.props.storage).observe({value:function(){return n.props.updateValue((function(){return m.FieldValue.empty}))},error:function(e){n.setState({alertState:{alert:u.AlertType.WARNING,message:"Failed to delete file: "+e},progress:null})}}):n.props.updateValue((function(){return m.FieldValue.empty}))},n.state={alertState:void 0,progress:void 0,progressText:void 0},n.getHandler()._setFileManager(n.getFileManager()),n}return a.__extends(FileInput,e),FileInput.prototype.getHandler=function(){var e=this.props.handler;if(!(e instanceof F))throw new Error("Invalid value handler for CompositeInput");return e},FileInput.prototype.getFileManager=function(){var e=this.context.semanticContext.repository;return new p.FileManager({repository:e})},FileInput.prototype.onDropAccepted=function(e){var t=this;this.setState({alertState:null,progress:null});var r=e[0];this.cancellation.map(this.getFileManager().uploadFileTemporary({storage:this.props.tempStorage,file:r,onProgress:function(e){return t.setState({progress:e,progressText:"Uploading ..."})}})).observe({value:function(e){t.setState({alertState:null,progress:null});var r=m.AtomicValue.set(t.props.value,{value:e});t.props.updateValue((function(){return r}))},error:function(e){t.setState({alertState:{alert:u.AlertType.WARNING,message:'Failed to upload file "'+r.name+'": '+e+" - "+e.response.text},progress:null})}})},FileInput.prototype.onDropRejected=function(e){var t=e[0];this.setState({alertState:{alert:u.AlertType.WARNING,message:"Incompatible file type: expected "+this.props.acceptPattern+", got "+t.type},progress:null})},FileInput.prototype.render=function(){var e=m.FieldValue.asRdfNode(this.props.value),t=e&&p.FileManager.isTemporaryResource(e);return l.createElement("div",{className:g.FileManager},l.createElement("div",{className:g.header},this.state.progress?l.createElement(i.ProgressBar,{active:!0,min:0,max:100,now:this.state.progress,label:this.state.progressText}):e&&!t?l.createElement("a",{className:g.uploadedImageIri,title:e.value,href:e.value},e.value):e?l.createElement("div",{className:g.uploadedImageIri,title:"File is loaded"},"File is loaded"):null),e?l.createElement("div",{className:g.fileContainer},l.createElement(f.default,{iri:e.value,storage:t?this.props.tempStorage:this.props.storage,namePredicateIri:this.props.namePredicateIri,mediaTypePredicateIri:this.props.mediaTypePredicateIri}),l.createElement("span",{className:g.caRemoveFile+" fa fa-times",onClick:this.removeFile})):this.renderBody())},FileInput.prototype.renderProgress=function(){return l.createElement("div",{className:g.emptyBody},"Loading..")},FileInput.prototype.renderError=function(){return l.createElement("div",{className:g.emptyBody},"Error")},FileInput.prototype.renderDropZone=function(){var e=this.state.alertState?l.createElement(u.Alert,a.__assign({},this.state.alertState)):null,t=this.props.placeholder||"Please drag&drop your file here.";return l.createElement("div",{className:g.FileUploader},l.createElement(c.Dropzone,{accept:this.props.acceptPattern,onDropAccepted:this.onDropAccepted.bind(this),onDropRejected:this.onDropRejected.bind(this),noClick:Boolean(this.state.progress)},this.props.children||l.createElement("div",{className:g.mpDropZonePlaceHolder},t)),e?l.createElement("div",{className:g.alertComponent},e):null)},FileInput.prototype.componentWillUnmount=function(){if(this.cancellation.cancelAll(),this.props&&"empty"!==this.props.value.type){var e=m.FieldValue.asRdfNode(this.props.value);p.FileManager.isTemporaryResource(e)&&this.getFileManager().removeTemporaryResource(e,this.props.storage)}},FileInput.makeHandler=function(e){return new F(e)},FileInput}(d.AtomicValueInput);t.FileInput=h;var F=function(e){function FileHandler(t){var r=e.call(this,t)||this;return r.baseInputProps=t.baseInputProps,r}return a.__extends(FileHandler,e),FileHandler.prototype._setFileManager=function(e){this.fileManager=e},FileHandler.prototype.finalize=function(e,t){var r=this;if(e.type===m.EmptyValue.type)return n.constant(e);var a=e.value;return p.FileManager.isTemporaryResource(a)?this.fileManager?this.fileManager.getFileResource(a).flatMap((function(t){return r.fileManager.createResourceFromTemporaryFile({fileName:t.fileName,storage:r.baseInputProps.storage,temporaryStorage:r.baseInputProps.tempStorage,generateIriQuery:r.baseInputProps.generateIriQuery,resourceQuery:r.baseInputProps.resourceQuery,mediaType:t.mediaType}).map((function(t){return m.AtomicValue.set(e,{value:t})}))})).toProperty():n.constant(m.FieldValue.replaceError(e,{kind:m.ErrorKind.Validation,message:"Cannot finalize FileInput value without a FileManager instance"})):n.constant(e)},FileHandler}(d.AtomicValueHandler);d.SingleValueInput.assertStatic(h),t.default=h}}]);
//# sourceMappingURL=semantic-form-file-input-1b07afe2961259f5ee78.js.map