mobileMenuPluginButton_ = false;
numericPluginVesion_ = 63;

if(W['windy-plugin-module-pluginCoordinator']) {
  if(W['windy-plugin-module-pluginCoordinator'].numericPluginVesion<numericPluginVesion_) {
    W['windy-plugin-module-pluginCoordinator'].disableListeners(W['windy-plugin-module-pluginCoordinator']);
    mobileMenuPluginButton_=W['windy-plugin-module-pluginCoordinator'].mobileMenuPluginButton;
    W.remove('windy-plugin-module-pluginCoordinator')
  }
}

if(!W['windy-plugin-module-pluginCoordinator']) {

    W.define(

        'windy-plugin-module-pluginCoordinator',
        [],
        function () {
            let pluginVersion='0.0.63';

            function changePluginsPluginButtons(loadedPlugin){
                let pluginsDiv=document.querySelector("#plugins-svelte-entrypoint");
                if (pluginsDiv && pluginsDiv.firstElementChild.children.length>2){
                    if (W.rootScope.isMobile || W.rootScope.isTablet) document.getElementById("plugin-plugins").style.zIndex=1000;
                    let c=pluginsDiv.firstElementChild.children;
                    for(let i=2;i<c.length;i++){
                        let linkNode=c[i].querySelector("a[href*='windy-plugin']");
                        let hr=linkNode.href;
                        console.log(hr);
                        let pluginName=hr.slice(hr.lastIndexOf("/")+1);
                        if (loadedPlugin==pluginName || (!loadedPlugin && W.plugins.hasOwnProperty(pluginName))){//if loadedPlugin not defined, then check each W.plugins
                            let but1=linkNode.nextElementSibling;
                            let but2=but1.nextElementSibling;
                            let newbut1=but1.cloneNode(true);
                            let newbut2=but2.cloneNode(true);
                            newbut1.innerHTML="Loaded";
                            Object.assign(newbut1.style,{opacity:0.5,cursor:"default"});
                            but1.parentNode.replaceChild(newbut1,but1);
                            newbut2.onclick=()=>{
                                W.plugins[pluginName].open();
                                W.plugins.plugins.close();
                            }
                            newbut2.classList.remove("disabled");
                            but2.parentNode.replaceChild(newbut2,but2);
                        }
                    }
                    return true;
                } else return false;
            }
            function externalPluginLoadedListener(e){
                setTimeout(changePluginsPluginButtons,500,e);
            }
            function pluginOpenedListener(e){
                //listen for when plugins plugin is opened and then deactivate load button for this plugin and change open button to only open
                if (e=="plugins"){
                    const changebutton=(attempt)=>{
                        if (!changePluginsPluginButtons()) if (attempt<10) setTimeout(changebutton, 200,attempt+1);
                    }
                    changebutton(0);
                }

                //if mobile add button to open plugin button to context menu.  Only do once,  set mobileMenuPluginButton true.
                else if (e=="contextmenu"){
                    if (!pluginCoordinator.mobileMenuPluginButton  &&  (W.rootScope.isMobile || W.rootScope.isTablet)){
                        pluginCoordinator.mobileMenuPluginButton=true;
                        let newbutton=document.createElement("a");
                        newbutton.innerHTML="Load other plugin";
                        newbutton.dataset.icon=String.fromCharCode(57406);
                        newbutton.onclick=()=>W.broadcast.fire("rqstOpen","plugins");
                        W.plugins.contextmenu.refs.menu.insertBefore(newbutton,W.plugins.contextmenu.refs.menu.lastElementChild);
                    }
                }

                // if a windy-plugin plugin is opened,  set lastOpened for opened plugin true,  remove infobox if exists,  clear picker content if exists,  close plugin pane is isOpen
                else if (e.indexOf("windy-plugin")>=0){
                    W.plugins[e].lastOpened=true;
                    pluginCoordinator.lastOpened=e;
                    if (W.plugins[e].refs.infobox) W.plugins[e].refs.infobox.style.display="block"; //should not be necessary

                }
            }
            function rqstOpenListener(e){

                //if another windy-plugin is requested open:  remove picker divs,  infobox display set to none, call onOtherPluginOpened if exists.  Set lastOpened false.
                if (e.indexOf("windy-plugin")>=0){
                    let pluginsAvail=Object.keys(W.plugins).filter(e2=>e2.indexOf("windy-plugin")>=0);
                    pluginsAvail.forEach(p=>{
                        if (p!=e){
                            if (W.plugins[p].onOtherPluginOpened) W.plugins[p].onOtherPluginOpened(e);
                            if (W.plugins[p].lastOpened){
                                if (W.plugins[p].isOpen) W.plugins[p].close();
                                if (W.plugins[p].refs.infobox) W.plugins[p].refs.infobox.style.display="none";
                                if (W['windy-plugin-module-pickerTools'])  W['windy-plugin-module-pickerTools'].removeElements();
                                if (W[p+"/pickerTools"] && W[p+"/pickerTools"].removeElements )  W[p+"/pickerTools"].removeElements();//not really necessary
                            }
                            W.plugins[p].lastOpened=false;
                        }
                    });
                }
            }

            let pluginCoordinator={
                description:`Listeners added to check if a windy-plugin was opened (and set to sleep if not the last plugin opened), to modify plugins plugin buttons so that loaded plugins are not reloaded,  and add open plugin button to mobile menu`,
                numericPluginVesion:numericPluginVesion_,
                mobileMenuPluginButton:mobileMenuPluginButton_,

                enableListeners(){
                    W.broadcast.on("externalPluginLoaded",externalPluginLoadedListener);
                    W.broadcast.on("pluginOpened",pluginOpenedListener);
                    W.broadcast.on("rqstOpen",rqstOpenListener);
                },
                disableListeners(){
                    W.broadcast.off("externalPluginLoaded",externalPluginLoadedListener);
                    W.broadcast.off("pluginOpened",pluginOpenedListener);
                    W.broadcast.off("rqstOpen",rqstOpenListener);
                }
            }
            pluginCoordinator.enableListeners();

            return pluginCoordinator;
        }
    );

    W.require('windy-plugin-module-pluginCoordinator');
}
