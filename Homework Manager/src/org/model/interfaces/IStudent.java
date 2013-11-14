/**
 * 
 */
package org.model.interfaces;

/**
 * @author Tamás
 *
 */
public interface IStudent {

	public void addNewTaskToTaskList(AbstractTask task);
	
	public void removeTaskFromTaskList(AbstractTask task);
	
	public AbstractTask acceptTask(AbstractTask task);
	
	public AbstractSolution createSolution(String name);
	
	public boolean uploadSolution(AbstractSolution solution);
	
	public int checkGrade();
	
	public String checkComment();
	
}
