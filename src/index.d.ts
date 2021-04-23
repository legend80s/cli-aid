import { minimist } from './utils/minimist';


type ICmdOpt = [
  ...string[], // cmd name and aliases if exists
  {
    default?: unknown;
    help?: string;
  }
]

type IParsedConfig = Parameters<typeof minimist>[1];
