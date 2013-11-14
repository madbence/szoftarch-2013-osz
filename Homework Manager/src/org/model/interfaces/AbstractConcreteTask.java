/**
 * 
 */
package org.model.interfaces;

import java.util.Calendar;

import javax.persistence.Embeddable;;

/**
 * @author Tamás
 *
 */
@Embeddable
public abstract class AbstractConcreteTask {

	protected String title;
	protected String description;
	protected int maxStudent;
	protected Calendar registrationEndDate;
	protected Calendar finishTaskDate;
	
	
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public int getMaxStudent() {
		return maxStudent;
	}
	public void setMaxStudent(int maxStudent) {
		this.maxStudent = maxStudent;
	}
	public Calendar getRegistrationEndDate() {
		return registrationEndDate;
	}
	public void setRegistrationEndDate(Calendar registrationEndDate) {
		this.registrationEndDate = registrationEndDate;
	}
	public Calendar getFinishTaskDate() {
		return finishTaskDate;
	}
	public void setFinishTaskDate(Calendar finishTaskDate) {
		this.finishTaskDate = finishTaskDate;
	}
	
	
	
}
