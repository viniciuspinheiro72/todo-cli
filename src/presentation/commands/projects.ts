import type { Command } from 'commander'
import chalk from 'chalk'
import { ListProjects } from '../../application/project/ListProjects.js'
import type { ProjectRepository } from '../../domain/project/ProjectRepository.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'

export function registerProjects(program: Command, projectRepo: ProjectRepository, todoRepo: TodoRepository): void {
  program
    .command('projects')
    .description('List all projects')
    .action(() => {
      const results = new ListProjects(projectRepo, todoRepo).execute()
      if (!results.length) { console.log(chalk.dim('  No projects yet.')); return }
      for (const { project, count } of results) {
        console.log(`  ${chalk.bold(project.name)} ${chalk.dim(`(${count} pending)`)}`)
      }
    })
}
