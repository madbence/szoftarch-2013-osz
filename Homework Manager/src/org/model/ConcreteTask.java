/**
 * 
 */
package org.model;

import java.util.Calendar;

import org.model.interfaces.AbstractConcreteTask;

/**
 * @author Tamás
 *
 */
public class ConcreteTask extends AbstractConcreteTask {

	public ConcreteTask() {
		this.title = null;
		this.description = null;
		this.maxStudent = 0;
		this.registrationEndDate = null;
		this.finishTaskDate = null;
	}
	
	public ConcreteTask(String title, String description, int maxStudent,
			Calendar registrationEndDate, Calendar finishTaskDate) {
		this.title = title;
		this.description = description;
		this.maxStudent = maxStudent;
		this.registrationEndDate = registrationEndDate;
		this.finishTaskDate = finishTaskDate;
	}
	
}
