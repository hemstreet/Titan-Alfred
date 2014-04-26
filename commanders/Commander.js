define(['altair/facades/declare',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin'
], function (declare,
             _IsCommanderMixin) {

    return declare([_IsCommanderMixin], {


        /**
         * Refresh server strategies so we have options for our schema
         *
         * @returns {altair.Deferred}
         */
        startup: function () {
            var _args = arguments;
            return this.module.refreshStrategies().then(this.hitch(function () { return this.inherited(_args); }));
        },

        /**
         * Startup the web server
         */
        start: function (options) {

            var named = options.strategy || this.module.get('defaultStrategy');

            //get an unstarted web server
            return this.module.refreshStrategies().then(this.hitch(function (strategies) {

               return this.module.foundry(strategies[named], null, false);

            })).then(this.hitch(function (server) {
                //prompt user for schema
                return this.form(server.schema());

            })).then(this.hitch(function (values) {

                //start the new server
                this.module.startupServer(named, values).otherwise(this.hitch('log'));

            }));



        },

        /**
         * Update schema at runtime
         *
         * @param named
         */
        schemaForCommand: function (named) {

            var schema = this.inherited(arguments),
                strategies;

            //the newModule command has some multiOptions that need updating (destination dir)
            if(named === 'start') {

                strategies = this.module.strategies();
                schema.setOptionFor('strategy', 'multiOptions', strategies);

            }


            return schema;
        }

    });
});