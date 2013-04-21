
/**
 *  this class contains cross-cutting aspects in the current application
 *   eg authentication/authorization, i18n and so on
 */
var Application =  {
	
	name: 'Nurc Gliders',
	version: '1.0',
	config: null,
	init: function( config ){
		this.config = config;
	},
	user: {
		isGuest: function(){
			return ( this.token === null );
		},
		login: function(username, password){
			var auth= 'Basic ' + Base64.encode(username+':'+password);
			Ext.Ajax.request({
	            method: 'GET',
	            url: Application.config.geostoreBaseUrl + 'users/user/details/',
	            scope: this,
	            headers: {
	                'Accept': 'application/json',
	                'Authorization' : auth
	            },
	            success: function(response) {
	                var user = Ext.util.JSON.decode(response.responseText);
					Application.user.token = auth;
					if (user.User){
						Application.user.username = user.User.name;
						Application.user.role = user.User.role;
					}
					if ( this.handlers['login'] ){
						this.handlers['login'].call(this, Application.user);
					}
					
	            },
	            failure: function(response) {
					console.error( response );
	                Application.user.token = null;
					if ( this.handlers['failed'] ){
						this.handlers['failed'].call(this, Application.user);
					}
					
	            }
	        });			
		},
		logout: function(){
			this.username = null;
			this.role = null;
			this.token = null;
			if ( this.handlers['logout'] ){
				this.handlers['logout'].call(this, this);
			}
			
		},
		on: function( action, handler ){
			this.handlers[ action ] = handler;
		},
		// TODO this should not be here
		getLoginButton: function(){
			if (! this.loginBtn ){
			this.loginBtn = new Ext.Button({
					iconCls: 'gxp-icon-user',
					text: 'Login',
					handler: function(){

						if ( Application.user.isGuest() ){
							var win = new Ext.Window({

					            title: 'Enter your credentials',
					            iconCls: 'gxp-icon-user',
					            layout: "fit",
					            width: 275,
								closeAction: 'hide',
					            height: 130,
					            plain: true,
					            border: false,
					            modal: true,
					            items: [{
									xtype:'form',
									ref:'loginForm',
									labelWidth:80,
									frame:true, 
									defaultType:'textfield',
									items:[
										{  
						                	fieldLabel: 'Username',
						                	ref:'../username', 
						                	allowBlank:false,
						                	listeners: {
						                 		beforeRender: function(field) {
						                    		field.focus(false, 1000);
						                  		}
						                	}
						            	},{  
						                	fieldLabel:'Password', 
						                	ref:'../password', 
						                	inputType:'password', 
						                	allowBlank:false
						            	}],
						            buttons:[{ 
						                text: 'Login',
						                iconCls: 'save',
						                formBind: true,
						                scope: this,
						                handler: function submitLogin(){
											if ( win.loginForm.getForm().isValid() ){
												Application.user.login( win.username.getValue(), win.password.getValue());
												win.destroy();
											} else {
												Ext.Msg.show({
														title: 'Cannot login',
														msg: 'You must specify a username and a password.',
														buttons: Ext.Msg.OK,
														icon: Ext.MessageBox.ERROR
												});
											}
										}
						            }],
									keys: [{ 
						                key: [Ext.EventObject.ENTER],
						                scope: this,
						                handler: function submitLogin(){
											if ( win.loginForm.getForm().isValid() ){
												Application.user.login( win.username.getValue(), win.password.getValue());
												win.destroy();
											} else {
												Ext.Msg.show({
														title: 'Cannot login',
														msg: 'You must specify a username and a password.',
														buttons: Ext.Msg.OK,
														icon: Ext.MessageBox.ERROR
												});
											}
										}
						            }]
								}],
					            listeners: {
					                afterRender: function(){
					                    win.loginForm.getForm().clearInvalid();
					                },
					                hide: function(){
					                    win.loginForm.getForm().reset();
					                }
					            }
					        });
					        win.show();

						} else {
							Ext.MessageBox.show({
							           title:'Logout',
							           msg: 'You are closing this application. Every unsaved changes will be lost. <br/>Are you sure?',
							           buttons: Ext.MessageBox.YESNO,
							           fn: function(btn){
											if ( btn === 'yes' ){
												Application.user.logout();
											}

									   },
							           icon: Ext.MessageBox.QUESTION
							       });
						}


					},
					scope: this
				});
			}
			return this.loginBtn;
			
		},
		username: null,
		role: null,
		token: null,
		handlers: new Object
	}
	
};
