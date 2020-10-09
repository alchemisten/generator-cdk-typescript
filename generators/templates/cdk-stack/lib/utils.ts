import * as fs from 'fs';
import * as path from 'path';
import {Construct} from "@aws-cdk/core";

export const parseContext = (construct: Construct, stage: string) => {
  const contextPath = path.resolve(__dirname, `../cdk.context.example.json`);

  if(!fs.existsSync(contextPath)) {
    console.warn(`Stage specific context not found`);
    return;
  }

  const rawContextStr = fs.readFileSync(contextPath, { encoding: 'utf-8' });
  const context = JSON.parse(rawContextStr);

  Object.keys(context).forEach(key => {
    construct.node.setContext(key, context[key]);
  });
}