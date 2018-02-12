var datasetPublic = SuperWidget.extend({
	
    //método iniciado quando a widget é carregada
    init: function() {
    	this.loadDataTable();
    },
  
    //BIND de eventos
    bindings: {
        local: {},
        global: {}
    },
    
    /*
     * Método de exemplo para carregar dataset via OAuth com $.ajax
     * 
     */
    loadDataset: function() {		 
		// API OAUTH utilizada: https://github.com/ddo/oauth-1.0a
    	var oauth = OAuth({
    	    consumer: {
    	        key: 'consumer key do Cadastro de OAuth App Fluig',
    	        secret: 'consumer secret do Cadastro de OAuth App Fluig'
    	    },
    	    signature_method: 'HMAC-SHA1',
    	    hash_function: function(base_string, key) {
    	        return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
    	    },
    	    nonce_length: 6
    	});
    	
		//  Recurso a ser consumido no fluig
    	var request_data = {
			// Necessário passar URL completa para não dar erro de signature invalid
    		url: 'http://fluigserver:port/api/public/ecm/dataset/search',
    		method: 'GET',
    		data: {
    			datasetId: 'globalCalendar'
    		}
    	};
    	
		// Tokens do usuário aplicativo para o Oauth APP cadastrado
    	var token = {
    		key: 'Access Token',
    		secret: 'Token Secret'
    	};
		
		/* A geração dos dados para autenticação OAuth , esta sendo gerado no atributo data do ajax 
		 * através da chamada do método: oauth.authorize(request_data, token)
		*/
	
    	$.ajax({
    		url: request_data.url,
    		crossDomain: true,
    		async: true,
    		type: request_data.method,    	
    		data: oauth.authorize(request_data, token)
    	}).done(function(data) {
    		
    	});
    },
    
    loadDataTable: function() {
    	
    	var userIsLogged = WCMAPI.getUserIsLogged();
    
    	var request_data = {
        	url: !userIsLogged ? 'http://fluigserver:port/api/public/ecm/dataset/search' : '/api/public/ecm/dataset/search',
        	method: 'GET',
        	data: {
        		datasetId : 'globalCalendar'
        	}
        };
    	
    	if (!userIsLogged) {
    		var oauth = OAuth({
        	    consumer: {
        	        key: 'consumer key do Cadastro de OAuth App Fluig',
					  secret: 'consumer secret do Cadastro de OAuth App Fluig'
        	    },
        	    signature_method: 'HMAC-SHA1',
        	    hash_function: function(base_string, key) {
        	        return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
        	    },
        	    nonce_length: 6
        	});
        	
        	var token = {
        		key: 'Access Token',
				secret: 'Token Secret'
        	};
    	}
    	
    	FLUIGC.datatable('[data-global-calendar]', {
    	    dataRequest: {
    	        url: request_data.url,
    	        options: {
    	            dataType: 'json',
    	            crossDomain: true,
    	            cache: true,
    	            type: request_data.method,
    	            data: request_data.data,
    	    		beforeSend: function(jqXHR, settings) {
    	    			if (!userIsLogged) {
    	    				/* O Datatable adiciona parametros na URL para ordenação, paginação e busca
    	    				 * Desta forma só é possivel gerar uma requisição corretamente via OAuth
    	    				 * após a adição dos parâmetros, por isso geramos a autorização no beforeSend
    	    				*/
							
							// Pega URL com os parâmetros adicionados pelo datatable
        	    			request_data.url = settings.url;
							// adiciona no atributo data do objeto request_data os dados para autenticação OAuth
        	    			request_data.data = $.extend(true, {}, request_data.data, oauth.authorize(request_data, token));
							// Altera URL com os novos parametros
        	    			settings.url = settings.url.split("?")[0] + "?" + $.param(request_data.data);
        	    			
    	    			}
    	    		}
    	        },
    	        root: 'content',
    	        limit: 50,
    	        offset: 0,
    	        patternKey: 'searchValue',
    	        limitkey: 'limit',
    	        offsetKey: 'offset'
    	    },
    	    renderContent: '.template_global_calendar',
    	    header: [
    	        {
    	            'title': 'Feriado',
    	            'dataorder': '',
    	            'size': 'col-md-8'
    	        },
    	        {
    	            'title': 'Data',
    	            'dataorder': '',
    	            'size': 'col-md-4',
    	        }
    	    ],
    	    multiSelect: false,
    	    classSelected: 'danger',
    	    search: {
    	        enabled: false
    	    },
    	    navButtons: {
    	        enabled: false,
    	        forwardstyle: 'btn-warning',
    	        backwardstyle: 'btn-warning',
    	    },
    	    emptyMessage: '<div class="text-center">No data to display.</div>',
    	    tableStyle: 'table-striped'
    	}, function(err, data) {
			// DO SOMETHING (error or success)
			console.log(data);
    	});
    }
});

