import { load } from 'graphql-load'
import modules from './graphql/modules'
import AccountsModule from './accounts'

load(modules)
load(AccountsModule)
